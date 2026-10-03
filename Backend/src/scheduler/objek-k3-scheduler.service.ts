import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ObjekK3SchedulerService
 *
 * Setiap hari jam 07:00 WIB (00:00 UTC) cek semua ObjekK3 berdasarkan
 * field `tanggalBerlaku` (tanggal expired riksa uji):
 *   - sudah lewat        → kirim notifikasi `license_expired`
 *   - ≤ 30 hari tersisa  → kirim notifikasi `license_expiring_soon`
 *
 * Penerima: SEMUA supervisor + admin (karena ini alat perusahaan, bukan milik
 * individu — semua supervisor perlu tahu status kelayakan alat).
 *
 * Deduplikasi per hari: notifikasi yang sama (objekK3Id + type) tidak akan
 * dikirim lebih dari sekali per hari.
 */
@Injectable()
export class ObjekK3SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ObjekK3SchedulerService.name);

  /** Jumlah hari sebelum expiry yang dianggap "akan segera expire" */
  private readonly SOON_THRESHOLD_DAYS = 30;

  constructor(private readonly prisma: PrismaService) {}

  // ── Jalankan saat backend start ───────────────────────────────────────────
  async onApplicationBootstrap(): Promise<void> {
    this.logger.log(
      '🚀 Backend started — menjalankan pengecekan riksa uji ObjekK3 awal...',
    );
    // Delay 5 detik agar koneksi DB stabil
    setTimeout(() => this.checkRiksaUji(), 5000);
  }

  // ── Cron: setiap hari jam 07:00 WIB = 00:00 UTC ──────────────────────────
  @Cron('0 0 * * *', { timeZone: 'UTC' })
  async checkRiksaUji(): Promise<void> {
    this.logger.log('⏰ Menjalankan pengecekan riksa uji ObjekK3...');
    const result = await this.runNow(false);
    this.logger.log(
      `✅ Pengecekan riksa uji selesai — ${result.created} notifikasi dibuat, ${result.skipped} dilewati.`,
    );
  }

  /**
   * Jalankan pengecekan manual — bisa dipanggil dari controller untuk testing.
   * @param force - jika true, abaikan deduplikasi harian
   */
  async runNow(force = false): Promise<{ created: number; skipped: number }> {
    this.logger.log('🔧 Pengecekan riksa uji ObjekK3 manual dipicu...');

    const now = new Date();
    const soonThreshold = new Date(now);
    soonThreshold.setDate(soonThreshold.getDate() + this.SOON_THRESHOLD_DAYS);

    // Key dedup: tanggal hari ini dalam UTC
    const todayKey = now.toISOString().split('T')[0];

    // Ambil semua ObjekK3 yang punya tanggalBerlaku
    const objekList = await this.prisma.objekK3.findMany({
      where: {
        tanggalBerlaku: { not: null },
      },
      select: {
        id: true,
        namaAlat: true,
        noSeri: true,
        kategori: true,
        tanggalBerlaku: true,
        statusRiksaUji: true,
      },
    });

    // Ambil semua supervisor + admin yang aktif
    const supervisorsAndAdmins = await this.prisma.user.findMany({
      where: {
        role: { in: ['supervisor', 'admin'] as any[] },
        approved: true,
      },
      select: { id: true },
    });

    const recipientIds = supervisorsAndAdmins.map((u) => u.id);

    if (recipientIds.length === 0) {
      this.logger.warn('Tidak ada supervisor/admin aktif untuk menerima notifikasi riksa uji');
      return { created: 0, skipped: 0 };
    }

    let notifCreated = 0;
    let notifSkipped = 0;

    for (const objek of objekList) {
      if (!objek.tanggalBerlaku) continue;

      const tanggalBerlaku = new Date(objek.tanggalBerlaku);
      if (isNaN(tanggalBerlaku.getTime())) continue;

      const isExpired = tanggalBerlaku < now;
      const isExpiringSoon = !isExpired && tanggalBerlaku <= soonThreshold;

      if (!isExpired && !isExpiringSoon) continue;

      const daysLeft = Math.ceil(
        (tanggalBerlaku.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const type: 'license_expired' | 'license_expiring_soon' = isExpired
        ? 'license_expired'
        : 'license_expiring_soon';

      const namaAlat = objek.namaAlat;
      const noSeri = objek.noSeri ? ` (${objek.noSeri})` : '';
      const tanggalStr = tanggalBerlaku.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const title = isExpired
        ? '🚨 Riksa Uji Sudah Expired!'
        : '⚠️ Riksa Uji Akan Segera Expired';

      const message = isExpired
        ? `Riksa Uji "${namaAlat}"${noSeri} sudah EXPIRED pada ${tanggalStr} (${Math.abs(daysLeft)} hari lalu). Alat ini TIDAK BOLEH dioperasikan sampai riksa uji diperpanjang!`
        : `Riksa Uji "${namaAlat}"${noSeri} akan expired dalam ${daysLeft} hari (${tanggalStr}). Segera jadwalkan perpanjangan riksa uji.`;

      for (const userId of recipientIds) {
        if (!force) {
          // Cek dedup: apakah notifikasi yang sama sudah ada hari ini?
          const alreadySent = await this.prisma.notification.findFirst({
            where: {
              userId,
              // Simpan objekK3Id di findingId (repurpose field) karena tidak ada field khusus
              // Format: "objek_k3:{id}" untuk membedakan dengan finding ID
              message: { contains: namaAlat },
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
            findingId: null, // ObjekK3 tidak punya findingId
            type,
            title,
            message,
            isRead: false,
          },
        });
        notifCreated++;
      }
    }

    this.logger.log(
      `📊 ObjekK3 riksa uji: ${objekList.length} objek diperiksa, ${notifCreated} notif dibuat, ${notifSkipped} dilewati`,
    );

    return { created: notifCreated, skipped: notifSkipped };
  }
}
