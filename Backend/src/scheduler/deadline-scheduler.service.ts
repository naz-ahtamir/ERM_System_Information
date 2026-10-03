import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * DeadlineSchedulerService
 *
 * Setiap hari jam 07:00 WIB (00:00 UTC) cek semua finding INPG yang:
 *   - deadlinePerbaikan sudah lewat (overdue), atau
 *   - deadlinePerbaikan tinggal ≤ 3 hari (soon)
 *
 * Untuk setiap temuan yang memenuhi syarat:
 *   - Kirim notifikasi ke pembuat temuan (createdById)
 *   - Kirim notifikasi ke supervisornya (jika ada)
 *   - Skip jika notifikasi dengan findingId + type + tanggal yang sama sudah ada
 *     (deduplikasi per hari agar tidak spam)
 */
@Injectable()
export class DeadlineSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DeadlineSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Jalankan otomatis saat backend start ──────────────────────────────────
  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('🚀 Backend started — menjalankan pengecekan deadline awal...');
    // Delay 2 detik agar koneksi DB stabil
    setTimeout(() => this.checkDeadlines(), 2000);
  }

  // ── Cron: setiap hari jam 07:00 WIB = 00:00 UTC ──────────────────────────
  @Cron('0 0 * * *', { timeZone: 'UTC' })
  async checkDeadlines(): Promise<void> {
    this.logger.log('⏰ Menjalankan pengecekan deadline temuan INPG...');

    const now = new Date();
    const soonThreshold = new Date(now);
    soonThreshold.setDate(soonThreshold.getDate() + 3); // 3 hari ke depan

    // Ambil semua finding INPG yang tidak dihapus
    const findings = await this.prisma.finding.findMany({
      where: {
        findingStatus: 'INPG',
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: { id: true, nama: true, supervisorId: true },
        },
      },
    });

    let notifCreated = 0;
    let notifSkipped = 0;

    for (const finding of findings) {
      const data = finding.data as Record<string, any>;
      const deadlineStr = data?.deadlinePerbaikan;
      if (!deadlineStr) continue;

      const deadline = new Date(deadlineStr);
      if (isNaN(deadline.getTime())) continue;

      const isOverdue = deadline < now;
      const isSoon = !isOverdue && deadline <= soonThreshold;
      if (!isOverdue && !isSoon) continue;

      const diffMs = deadline.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const title = isOverdue
        ? '⚠️ Deadline Temuan Terlewat'
        : '🕐 Deadline Temuan Mendekat';

      const message = isOverdue
        ? `Temuan "${finding.title}" sudah melewati deadline perbaikan ${Math.abs(daysLeft)} hari yang lalu. Segera selesaikan!`
        : `Temuan "${finding.title}" mendekati deadline perbaikan. Sisa ${daysLeft} hari.`;

      // Kumpulkan penerima: pembuat + supervisor (jika ada)
      const recipientIds = new Set<string>([finding.createdById]);
      if (finding.createdBy?.supervisorId) {
        recipientIds.add(finding.createdBy.supervisorId);
      }

      // Tanggal hari ini sebagai key deduplikasi (format YYYY-MM-DD)
      const todayKey = now.toISOString().split('T')[0];

      for (const userId of recipientIds) {
        // Cek apakah notifikasi yang sama sudah ada hari ini
        const alreadySent = await this.prisma.notification.findFirst({
          where: {
            userId,
            findingId: finding.id,
            type: 'deadline_reminder',
            // createdAt antara awal dan akhir hari ini
            createdAt: {
              gte: new Date(`${todayKey}T00:00:00.000Z`),
              lt: new Date(`${todayKey}T23:59:59.999Z`),
            },
          },
        });

        if (alreadySent) {
          notifSkipped++;
          continue;
        }

        await this.prisma.notification.create({
          data: {
            userId,
            findingId: finding.id,
            type: 'deadline_reminder',
            title,
            message,
            isRead: false,
          },
        });
        notifCreated++;
      }
    }

    this.logger.log(
      `✅ Pengecekan selesai — ${notifCreated} notifikasi dibuat, ${notifSkipped} dilewati (sudah ada hari ini).`,
    );
  }

  /**
   * Jalankan pengecekan manual — bisa dipanggil dari controller untuk testing.
   * @param force - jika true, abaikan deduplikasi harian (untuk dev/testing)
   */
  async runNow(force = false): Promise<{ created: number; skipped: number }> {
    this.logger.log('🔧 Pengecekan deadline manual dipicu...');

    const now = new Date();
    const soonThreshold = new Date(now);
    soonThreshold.setDate(soonThreshold.getDate() + 3);

    const findings = await this.prisma.finding.findMany({
      where: { findingStatus: 'INPG', deletedAt: null },
      include: {
        createdBy: { select: { id: true, nama: true, supervisorId: true } },
      },
    });

    let notifCreated = 0;
    let notifSkipped = 0;
    const todayKey = now.toISOString().split('T')[0];

    for (const finding of findings) {
      const data = finding.data as Record<string, any>;
      const deadlineStr = data?.deadlinePerbaikan;
      if (!deadlineStr) continue;

      const deadline = new Date(deadlineStr);
      if (isNaN(deadline.getTime())) continue;

      const isOverdue = deadline < now;
      const isSoon = !isOverdue && deadline <= soonThreshold;
      if (!isOverdue && !isSoon) continue;

      const diffMs = deadline.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const title = isOverdue ? '⚠️ Deadline Temuan Terlewat' : '🕐 Deadline Temuan Mendekat';
      const message = isOverdue
        ? `Temuan "${finding.title}" sudah melewati deadline perbaikan ${Math.abs(daysLeft)} hari yang lalu. Segera selesaikan!`
        : `Temuan "${finding.title}" mendekati deadline perbaikan. Sisa ${daysLeft} hari.`;

      const recipientIds = new Set<string>([finding.createdById]);
      if (finding.createdBy?.supervisorId) recipientIds.add(finding.createdBy.supervisorId);

      for (const userId of recipientIds) {
        if (!force) {
          const alreadySent = await this.prisma.notification.findFirst({
            where: {
              userId,
              findingId: finding.id,
              type: 'deadline_reminder',
              createdAt: {
                gte: new Date(`${todayKey}T00:00:00.000Z`),
                lt: new Date(`${todayKey}T23:59:59.999Z`),
              },
            },
          });
          if (alreadySent) { notifSkipped++; continue; }
        }

        await this.prisma.notification.create({
          data: { userId, findingId: finding.id, type: 'deadline_reminder', title, message, isRead: false },
        });
        notifCreated++;
      }
    }

    return { created: notifCreated, skipped: notifSkipped };
  }
}
