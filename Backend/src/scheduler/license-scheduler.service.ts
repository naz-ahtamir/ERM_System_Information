import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * LicenseSchedulerService
 *
 * Setiap hari jam 07:00 WIB (00:00 UTC) cek semua record license (scomp-license):
 *   - masaBerlaku sudah lewat  → kirim notifikasi `license_expired`
 *   - masaBerlaku ≤ 30 hari    → kirim notifikasi `license_expiring_soon`
 *
 * Penerima notifikasi:
 *   1. Pemilik license (createdById)
 *   2. Supervisor pemilik (jika ada)
 *   3. Semua user dengan role admin
 *
 * Deduplikasi per hari: notifikasi yang sama (findingId + type) tidak akan
 * dikirim lebih dari sekali per hari.
 */
@Injectable()
export class LicenseSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LicenseSchedulerService.name);

  /** Jumlah hari sebelum expiry yang dianggap "akan segera expire" */
  private readonly SOON_THRESHOLD_DAYS = 30;

  constructor(private readonly prisma: PrismaService) {}

  // ── Jalankan saat backend start ───────────────────────────────────────────
  async onApplicationBootstrap(): Promise<void> {
    this.logger.log(
      '🚀 Backend started — menjalankan pengecekan masa berlaku license awal...',
    );
    // Delay 3 detik agar koneksi DB stabil
    setTimeout(() => this.checkLicenses(), 3000);
  }

  // ── Cron: setiap hari jam 07:00 WIB = 00:00 UTC ──────────────────────────
  @Cron('0 0 * * *', { timeZone: 'UTC' })
  async checkLicenses(): Promise<void> {
    this.logger.log(
      '⏰ Menjalankan pengecekan masa berlaku license & sertifikasi...',
    );
    const result = await this.runNow(false);
    this.logger.log(
      `✅ Pengecekan selesai — ${result.created} notifikasi dibuat, ${result.skipped} dilewati.`,
    );
  }

  /**
   * Jalankan pengecekan manual — bisa dipanggil dari controller untuk testing.
   * @param force - jika true, abaikan deduplikasi harian
   */
  async runNow(force = false): Promise<{ created: number; skipped: number }> {
    this.logger.log('🔧 Pengecekan license manual dipicu...');

    const now = new Date();
    const soonThreshold = new Date(now);
    soonThreshold.setDate(soonThreshold.getDate() + this.SOON_THRESHOLD_DAYS);

    // Key dedup: tanggal hari ini dalam UTC
    const todayKey = now.toISOString().split('T')[0];

    // Ambil semua record license yang aktif
    const licenses = await this.prisma.finding.findMany({
      where: {
        subElementId: 'scomp-license',
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: { id: true, nama: true, supervisorId: true },
        },
      },
    });

    // Ambil semua admin
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });
    const adminIds = admins.map((a) => a.id);

    let notifCreated = 0;
    let notifSkipped = 0;

    for (const license of licenses) {
      const data = license.data as Record<string, any>;

      // masaBerlaku bisa berupa string ISO date
      const masaBerlakuStr: string | undefined = data?.masaBerlaku;
      if (!masaBerlakuStr) continue;

      const masaBerlaku = new Date(masaBerlakuStr);
      if (isNaN(masaBerlaku.getTime())) continue;

      // Tentukan status
      const isExpired = masaBerlaku < now;
      const isExpiringSoon =
        !isExpired && masaBerlaku <= soonThreshold;

      if (!isExpired && !isExpiringSoon) continue;

      const daysLeft = Math.ceil(
        (masaBerlaku.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const type: 'license_expired' | 'license_expiring_soon' = isExpired
        ? 'license_expired'
        : 'license_expiring_soon';

      const employeeName: string = data?.nama ?? 'Karyawan';
      const certType: string = data?.jenisSertifikat ?? 'Sertifikat';
      const noSertifikat: string = data?.noSertifikat ?? '';

      const title = isExpired
        ? '🔴 Sertifikat / Lisensi Kedaluwarsa'
        : '🟡 Masa Berlaku Sertifikat Akan Berakhir';

      const message = isExpired
        ? `Sertifikat "${certType}"${noSertifikat ? ` (${noSertifikat})` : ''} atas nama ${employeeName} telah kedaluwarsa pada ${masaBerlaku.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}. Segera perbarui!`
        : `Sertifikat "${certType}"${noSertifikat ? ` (${noSertifikat})` : ''} atas nama ${employeeName} akan kedaluwarsa dalam ${daysLeft} hari (${masaBerlaku.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}). Siapkan pembaruan.`;

      // Kumpulkan penerima: pemilik + supervisor + semua admin
      const recipientIds = new Set<string>([license.createdById]);

      if (license.createdBy?.supervisorId) {
        recipientIds.add(license.createdBy.supervisorId);
      }

      for (const adminId of adminIds) {
        recipientIds.add(adminId);
      }

      for (const userId of recipientIds) {
        if (!force) {
          // Cek dedup: apakah notifikasi yang sama sudah ada hari ini?
          const alreadySent = await this.prisma.notification.findFirst({
            where: {
              userId,
              findingId: license.id,
              type,
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
        }

        await this.prisma.notification.create({
          data: {
            userId,
            findingId: license.id,
            type,
            title,
            message,
            isRead: false,
          },
        });
        notifCreated++;
      }
    }

    return { created: notifCreated, skipped: notifSkipped };
  }
}
