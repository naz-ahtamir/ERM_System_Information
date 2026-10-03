import { Controller, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/notifications/seed')
@UseGuards(JwtAuthGuard)
export class SeedNotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /api/notifications/seed
   *
   * Seed notifikasi ke SEMUA supervisor & admin berdasarkan data REAL di DB:
   *   - finding_submitted  : setiap finding INPG yang ada
   *   - approval_required  : finding INPG yang sudah punya findingStatus INPG
   *   - deadline_reminder  : finding INPG yang punya deadlinePerbaikan (< 7 hari)
   *   - license_expiring_soon : scomp-license yang masaBerlaku ≤ 30 hari
   *   - license_expired       : scomp-license yang masaBerlaku sudah lewat
   *   - (riksa uji dari ObjekK3 ditangani oleh ObjekK3SchedulerService)
   */
  @Post()
  async seedNotifications(@Request() req: any) {
    const now = new Date();

    // ── Ambil semua supervisor + admin aktif ───────────────────────────────
    const supervisors = await this.prisma.user.findMany({
      where: { role: { in: ['supervisor', 'admin'] as any[] }, approved: true },
      select: { id: true, nama: true, role: true },
    });

    if (supervisors.length === 0) {
      return { message: 'Tidak ada supervisor/admin di database', count: 0 };
    }

    const created: any[] = [];

    // ── 1. finding_submitted & approval_required: dari INPG findings ───────
    const inpgFindings = await this.prisma.finding.findMany({
      where: { findingStatus: 'INPG', deletedAt: null },
      include: { createdBy: { select: { nama: true, supervisorId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10, // maksimal 10 agar tidak flood
    });

    for (const finding of inpgFindings) {
      const creatorNama = finding.createdByName || finding.createdBy?.nama || 'User';

      // Kirim ke supervisor spesifik jika ada, fallback ke semua supervisor
      const targetIds: string[] = [];
      if (finding.createdBy?.supervisorId) {
        targetIds.push(finding.createdBy.supervisorId);
      } else {
        targetIds.push(...supervisors.map((s) => s.id));
      }

      for (const userId of targetIds) {
        // finding_submitted
        const n1 = await this.notificationsService.create({
          userId,
          type: 'finding_submitted',
          title: 'Temuan Baru Dilaporkan',
          message: `${creatorNama} melaporkan temuan: "${finding.title}". Harap ditinjau dan setujui.`,
          findingId: finding.id,
          isRead: false,
        });
        created.push(n1);

        // approval_required (temuan yang sama butuh approval)
        const n2 = await this.notificationsService.create({
          userId,
          type: 'approval_required',
          title: 'Butuh Persetujuan Supervisor',
          message: `Finding "${finding.title}" oleh ${creatorNama} memerlukan persetujuan Anda sebelum PIC dapat ditugaskan.`,
          findingId: finding.id,
          isRead: false,
        });
        created.push(n2);
      }
    }

    // ── 2. deadline_reminder: INPG findings dengan deadline dekat ──────────
    for (const finding of inpgFindings) {
      const data = finding.data as Record<string, any>;
      const deadlineStr = data?.deadlinePerbaikan || data?.followUpDeadline;
      if (!deadlineStr) continue;

      const deadline = new Date(deadlineStr);
      if (isNaN(deadline.getTime())) continue;

      const daysLeft = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Hanya kirim jika deadline ≤ 7 hari ke depan atau sudah lewat
      if (daysLeft > 7) continue;

      const isOverdue = deadline < now;
      const deadlineLabel = deadline.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      });

      const targetIds: string[] = [];
      if (finding.createdBy?.supervisorId) {
        targetIds.push(finding.createdBy.supervisorId);
      } else {
        targetIds.push(...supervisors.map((s) => s.id));
      }

      for (const userId of targetIds) {
        const n = await this.notificationsService.create({
          userId,
          type: 'deadline_reminder',
          title: isOverdue ? '🚨 Deadline Perbaikan Sudah Lewat!' : '⏰ Deadline Perbaikan Mendekat',
          message: isOverdue
            ? `Finding "${finding.title}" sudah melewati deadline perbaikan (${deadlineLabel}, ${Math.abs(daysLeft)} hari lalu). Segera tindak lanjuti!`
            : `Finding "${finding.title}" deadline perbaikan dalam ${daysLeft} hari (${deadlineLabel}). Koordinasikan dengan PIC.`,
          findingId: finding.id,
          isRead: false,
        });
        created.push(n);
      }
    }

    // ── 3. license_expiring_soon & license_expired: dari scomp-license ─────
    const licenses = await this.prisma.finding.findMany({
      where: { subElementId: 'scomp-license', deletedAt: null },
      include: { createdBy: { select: { nama: true, supervisorId: true } } },
      orderBy: { createdAt: 'desc' },
    });

    for (const license of licenses) {
      const data = license.data as Record<string, any>;
      const masaBerlakuStr = data?.masaBerlaku;
      if (!masaBerlakuStr) continue;

      const masaBerlaku = new Date(masaBerlakuStr);
      if (isNaN(masaBerlaku.getTime())) continue;

      const daysLeft = Math.ceil(
        (masaBerlaku.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const isExpired = masaBerlaku < now;
      const isExpiringSoon = !isExpired && daysLeft <= 30;

      if (!isExpired && !isExpiringSoon) continue;

      const employeeName = data?.nama || license.createdByName || 'Karyawan';
      const certType = data?.jenisSertifikat || data?.tipeSertifikat || 'Sertifikat';
      const noSertifikat = data?.noSertifikat ? ` (${data.noSertifikat})` : '';
      const tanggalStr = masaBerlaku.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      });

      // Kirim ke pemilik + supervisornya + semua admin
      const recipientIds = new Set<string>([license.createdById]);
      if (license.createdBy?.supervisorId) {
        recipientIds.add(license.createdBy.supervisorId);
      }
      supervisors
        .filter((s) => s.role === 'admin')
        .forEach((a) => recipientIds.add(a.id));

      for (const userId of recipientIds) {
        const n = await this.notificationsService.create({
          userId,
          type: isExpired ? 'license_expired' : 'license_expiring_soon',
          title: isExpired ? '🔴 Sertifikat Kedaluwarsa' : '🟡 Sertifikat Akan Berakhir',
          message: isExpired
            ? `Sertifikat "${certType}"${noSertifikat} atas nama ${employeeName} telah kedaluwarsa pada ${tanggalStr}. Segera perbarui!`
            : `Sertifikat "${certType}"${noSertifikat} atas nama ${employeeName} akan kedaluwarsa dalam ${daysLeft} hari (${tanggalStr}). Siapkan pembaruan.`,
          findingId: license.id,
          isRead: false,
        });
        created.push(n);
      }
    }

    // ── 4. riksa_uji_expired & riksa_uji_expiring_soon: dari ObjekK3 ─────────
    const objekK3List = await this.prisma.objekK3.findMany({
      where: {
        tanggalBerlaku: { not: null },
      },
      select: {
        id: true,
        namaAlat: true,
        noSeri: true,
        tanggalBerlaku: true,
        statusRiksaUji: true,
        createdById: true,
        createdBy: { select: { nama: true, supervisorId: true } },
      },
    });

    for (const alat of objekK3List) {
      if (!alat.tanggalBerlaku) continue;

      const daysLeft = Math.ceil(
        (alat.tanggalBerlaku.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const isExpired = alat.tanggalBerlaku < now;
      const isExpiringSoon = !isExpired && daysLeft <= 30;

      if (!isExpired && !isExpiringSoon) continue;

      const tanggalStr = alat.tanggalBerlaku.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
      const alatLabel = `${alat.namaAlat} (${alat.noSeri})`;

      // Kirim ke semua supervisor + admin
      for (const sv of supervisors) {
        const n = await this.notificationsService.create({
          userId: sv.id,
          type: isExpired ? 'license_expired' : 'license_expiring_soon',
          title: isExpired
            ? '🔴 Riksa Uji Alat Kedaluwarsa'
            : '🟡 Riksa Uji Alat Akan Berakhir',
          message: isExpired
            ? `Surat keterangan riksa uji ${alatLabel} telah kedaluwarsa pada ${tanggalStr}. Segera jadwalkan riksa uji ulang!`
            : `Surat keterangan riksa uji ${alatLabel} akan berakhir dalam ${daysLeft} hari (${tanggalStr}). Siapkan jadwal riksa uji.`,
          objekK3Id: alat.id,
          isRead: false,
        });
        created.push(n);
      }
    }

    return {
      message: `Notifikasi berhasil dibuat dari data real DB`,
      count: created.length,
      breakdown: {
        inpgFindings: inpgFindings.length,
        licenses: licenses.length,
        objekK3: objekK3List.filter((a) => {
          if (!a.tanggalBerlaku) return false;
          const d = Math.ceil((a.tanggalBerlaku.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return a.tanggalBerlaku < now || d <= 30;
        }).length,
        supervisorTargets: supervisors.length,
      },
      targets: supervisors.map((s) => ({ nama: s.nama, role: s.role })),
    };
  }

  /**
   * DELETE /api/notifications/seed
   * Hapus semua notifikasi (cleanup untuk testing ulang).
   */
  @Delete()
  async clearNotifications() {
    const result = await this.prisma.notification.deleteMany({});
    return {
      message: `${result.count} notifikasi dihapus`,
      count: result.count,
    };
  }
}
