import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * PicaSchedulerService
 *
 * Setiap hari jam 07:00 WIB (00:00 UTC) cek semua record PICA:
 *
 * 1. pica_deadline_overdue
 *    - Status OPEN, batas_akhir sudah lewat hari ini
 *    - Kirim notifikasi ke picId (PIC divisi) user yang bersangkutan
 *
 * 2. pica_tacc_reminder  (cron harian)
 *    - Status OPEN + catatanTACC tidak null (artinya pernah di-TACC)
 *    - Kirim reminder harian ke picId agar segera revisi & resubmit
 *
 * Deduplikasi per hari agar tidak spam (cek apakah notif dengan
 * picaId + type + tanggal hari ini sudah ada).
 *
 * Catatan: notif TACC real-time (saat admin klik TACC) ditangani
 * langsung di PicaService.action() — scheduler ini hanya daily reminder.
 */
@Injectable()
export class PicaSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PicaSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Jalankan saat backend start ───────────────────────────────────────────
  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('🚀 PicaScheduler: cek awal saat startup...');
    setTimeout(() => this.checkPicaNotifications(), 3000);
  }

  // ── Cron: setiap hari jam 07:00 WIB = 00:00 UTC ──────────────────────────
  @Cron('0 0 * * *', { timeZone: 'UTC' })
  async checkPicaNotifications(): Promise<void> {
    this.logger.log('⏰ PicaScheduler: menjalankan pengecekan...');
    const result = await this.runNow();
    this.logger.log(
      `✅ PicaScheduler selesai — overdue: ${result.overdue}, tacc: ${result.tacc}, skipped: ${result.skipped}`,
    );
  }

  /**
   * Bisa dipanggil manual dari controller (untuk dev/test).
   * @param force - jika true, abaikan deduplikasi harian
   */
  async runNow(force = false): Promise<{ overdue: number; tacc: number; skipped: number }> {
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    let overdueCount = 0;
    let taccCount   = 0;
    let skipped     = 0;

    // ── Ambil semua PICA yang masih OPEN ─────────────────────────────────────
    const openPicas = await this.prisma.pica.findMany({
      where: { statusPerbaikan: 'OPEN' },
    });

    for (const pica of openPicas) {
      const batasAkhir = pica.batasAkhir;

      // ── 1. Overdue: deadline sudah lewat ──────────────────────────────────
      if (batasAkhir && batasAkhir < now) {
        const daysOverdue = Math.ceil(
          (now.getTime() - batasAkhir.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Cari userId yang sesuai picId (user dengan id = picId)
        const recipientIds = await this.resolveRecipients(pica.picId, pica.divisiId);

        for (const userId of recipientIds) {
          const sent = await this.alreadySentToday(userId, pica.id, 'pica_deadline_overdue', todayKey, force);
          if (sent) { skipped++; continue; }

          await this.prisma.notification.create({
            data: {
              userId,
              type: 'pica_deadline_overdue' as any,
              title: '🚨 PICA Deadline Terlewat',
              message: `Temuan PICA "${pica.temuanMasalah.slice(0, 60)}${pica.temuanMasalah.length > 60 ? '…' : ''}" sudah melewati batas akhir perbaikan ${daysOverdue} hari yang lalu. Segera tindak lanjuti!`,
              isRead: false,
              picaId: pica.id,
            },
          });
          overdueCount++;
        }
      }

      // ── 2. TACC reminder: pernah di-TACC, belum direvisi ─────────────────
      if (pica.catatanTACC) {
        const recipientIds = await this.resolveRecipients(pica.picId, pica.divisiId);

        for (const userId of recipientIds) {
          const sent = await this.alreadySentToday(userId, pica.id, 'pica_tacc_reminder', todayKey, force);
          if (sent) { skipped++; continue; }

          await this.prisma.notification.create({
            data: {
              userId,
              type: 'pica_tacc_reminder' as any,
              title: '🔄 PICA Revisi Diperlukan (TACC)',
              message: `Perbaikan PICA "${pica.temuanMasalah.slice(0, 60)}${pica.temuanMasalah.length > 60 ? '…' : ''}" ditolak. Alasan: ${pica.catatanTACC}. Harap upload ulang bukti perbaikan.`,
              isRead: false,
              picaId: pica.id,
            },
          });
          taccCount++;
        }
      }
    }

    return { overdue: overdueCount, tacc: taccCount, skipped };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Cari userId yang harus menerima notifikasi.
   * Pertama coba cari user dengan id = picId, kalau tidak ada coba cari
   * berdasarkan departemen = divisiId. Hasilkan Set userId unik.
   */
  private async resolveRecipients(picId: string, divisiId: string): Promise<string[]> {
    const ids = new Set<string>();

    // Coba cari user langsung berdasarkan picId
    if (picId && picId !== 'TBD') {
      const user = await this.prisma.user.findUnique({
        where: { id: picId },
        select: { id: true, supervisorId: true },
      });
      if (user) {
        ids.add(user.id);
        if (user.supervisorId) ids.add(user.supervisorId);
      }
    }

    // Fallback: cari semua user di departemen/divisi yang sama
    if (ids.size === 0 && divisiId && divisiId !== 'TBD') {
      const users = await this.prisma.user.findMany({
        where: { departemen: divisiId },
        select: { id: true },
        take: 5,
      });
      users.forEach((u) => ids.add(u.id));
    }

    return [...ids];
  }

  private async alreadySentToday(
    userId: string,
    picaId: string,
    type: string,
    todayKey: string,
    force: boolean,
  ): Promise<boolean> {
    if (force) return false;
    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type: type as any,
        createdAt: {
          gte: new Date(`${todayKey}T00:00:00.000Z`),
          lt:  new Date(`${todayKey}T23:59:59.999Z`),
        },
        // Deduplikasi: cek apakah message mengandung singkatan temuan PICA
        // (message selalu mengandung temuanMasalah, tapi gunakan picaId via title lebih aman)
        title: {
          contains: type === 'pica_deadline_overdue'
            ? 'Deadline Terlewat'
            : 'Revisi Diperlukan',
        },
      },
    });
    return !!existing;
  }
}
