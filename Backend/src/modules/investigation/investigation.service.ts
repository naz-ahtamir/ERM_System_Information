import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { SignApprovalDto, SignVictimDto, SignSupervisorDto } from './dto/sign-investigation.dto';
import { InvestigationStatus, Prisma } from '@prisma/client';

// ── Prisma include shape ──────────────────────────────────────────────────────

const INCLUDE = {
  pelapor: { select: { id: true, nama: true, jabatan: true, departemen: true } },
  investigator: { select: { id: true, nama: true, jabatan: true } },
  approvedBy: { select: { id: true, nama: true, jabatan: true } },
  finding: { select: { id: true, title: true, findingStatus: true } },
  logs: {
    include: { user: { select: { id: true, nama: true } } },
    orderBy: { timestamp: 'desc' as const },
  },
} satisfies Prisma.InvestigationInclude;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDate(v?: string | null): Date | undefined {
  return v ? new Date(v) : undefined;
}

@Injectable()
export class InvestigationService {
  constructor(private prisma: PrismaService) {}

  // ── Private: create log ───────────────────────────────────────────────────

  private async addLog(
    tx: Prisma.TransactionClient,
    investigationId: string,
    userId: string,
    action: string,
    description: string,
  ) {
    await tx.investigationLog.create({
      data: { investigationId, userId, action, description },
    });
  }

  // ── Create (DRAFT) ─────────────────────────────────────────────────────────

  async create(pelaporId: string, dto: CreateInvestigationDto) {
    return this.prisma.$transaction(async (tx) => {
      const daftarKorban = dto.daftarKorban
        ? (() => {
            try { return JSON.parse(dto.daftarKorban!); }
            catch { return dto.daftarKorban; }
          })()
        : null;

      const inv = await tx.investigation.create({
        data: {
          tanggalKejadian:   new Date(dto.tanggalKejadian),
          waktuKejadian:     dto.waktuKejadian,
          lokasi:            dto.lokasi,
          area:              dto.area,
          deskripsiKejadian: dto.deskripsiKejadian,
          jenisKecelakaan:   dto.jenisKecelakaan,
          jumlahKorban:      dto.jumlahKorban ?? 0,
          daftarKorban:      daftarKorban ?? Prisma.JsonNull,
          saksi:             dto.saksi ?? null,
          kerugianMaterial:  dto.kerugianMaterial ?? null,
          fotoBukti:         dto.fotoBukti ?? null,
          pelaporId,
          status:            InvestigationStatus.DRAFT,
        },
        include: INCLUDE,
      });

      await this.addLog(tx, inv.id, pelaporId, 'CREATED', 'Laporan kecelakaan dibuat');
      return inv;
    });
  }

  // ── Find All ───────────────────────────────────────────────────────────────

  async findAll(filters: {
    status?: string;
    jenisKecelakaan?: string;
    pelaporId?: string;
    search?: string;
  }) {
    const where: Prisma.InvestigationWhereInput = {};

    if (filters.status)          where.status = filters.status as InvestigationStatus;
    if (filters.jenisKecelakaan) where.jenisKecelakaan = filters.jenisKecelakaan as any;
    if (filters.pelaporId)       where.pelaporId = filters.pelaporId;

    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { lokasi:            { contains: q, mode: 'insensitive' } },
        { area:              { contains: q, mode: 'insensitive' } },
        { deskripsiKejadian: { contains: q, mode: 'insensitive' } },
        { saksi:             { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.investigation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: INCLUDE,
    });
  }

  // ── Find One ───────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const inv = await this.prisma.investigation.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!inv) throw new NotFoundException(`Investigation ${id} tidak ditemukan`);
    return inv;
  }

  // ── Update data kecelakaan & investigasi ───────────────────────────────────

  async update(id: string, userId: string, dto: UpdateInvestigationDto) {
    const inv = await this.findOne(id);

    // Hanya boleh update jika status belum COMPLETED / REJECTED
    if (['COMPLETED', 'REJECTED'].includes(inv.status)) {
      throw new BadRequestException('Investigasi sudah selesai, tidak bisa diedit');
    }

    return this.prisma.$transaction(async (tx) => {
      const daftarKorban = dto.daftarKorban
        ? (() => {
            try { return JSON.parse(dto.daftarKorban!); }
            catch { return dto.daftarKorban; }
          })()
        : undefined;

      const updated = await tx.investigation.update({
        where: { id },
        data: {
          ...(dto.tanggalKejadian   && { tanggalKejadian:   new Date(dto.tanggalKejadian) }),
          ...(dto.waktuKejadian     && { waktuKejadian:     dto.waktuKejadian }),
          ...(dto.lokasi            && { lokasi:            dto.lokasi }),
          ...(dto.area              && { area:              dto.area }),
          ...(dto.deskripsiKejadian && { deskripsiKejadian: dto.deskripsiKejadian }),
          ...(dto.jenisKecelakaan   && { jenisKecelakaan:   dto.jenisKecelakaan }),
          ...(dto.jumlahKorban != null && { jumlahKorban:   dto.jumlahKorban }),
          ...(daftarKorban !== undefined && { daftarKorban }),
          ...(dto.saksi             !== undefined && { saksi:            dto.saksi ?? null }),
          ...(dto.kerugianMaterial  !== undefined && { kerugianMaterial: dto.kerugianMaterial ?? null }),
          ...(dto.fotoBukti         !== undefined && { fotoBukti:        dto.fotoBukti ?? null }),
          // Investigasi
          ...(dto.investigatorId       && { investigatorId:       dto.investigatorId }),
          ...(dto.tanggalInvestigasi   && { tanggalInvestigasi:   new Date(dto.tanggalInvestigasi) }),
          ...(dto.rootCause            !== undefined && { rootCause:            dto.rootCause ?? null }),
          ...(dto.temuanInvestigasi    !== undefined && { temuanInvestigasi:    dto.temuanInvestigasi ?? null }),
          ...(dto.rekomendasiPerbaikan !== undefined && { rekomendasiPerbaikan: dto.rekomendasiPerbaikan ?? null }),
          ...(dto.lampiranLaporan      !== undefined && { lampiranLaporan:      dto.lampiranLaporan ?? null }),
          ...(dto.catatanTambahan      !== undefined && { catatanTambahan:      dto.catatanTambahan ?? null }),
        },
        include: INCLUDE,
      });

      await this.addLog(tx, id, userId, 'UPDATED', 'Data investigasi diperbarui');
      return updated;
    });
  }

  // ── Transisi Status ────────────────────────────────────────────────────────

  // Tahap 2: Mulai investigasi (DRAFT → UNDER_INVESTIGATION)
  async startInvestigation(id: string, userId: string, investigatorId?: string) {
    const inv = await this.findOne(id);
    if (inv.status !== InvestigationStatus.DRAFT) {
      throw new BadRequestException('Hanya investigasi berstatus DRAFT yang bisa dimulai');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.investigation.update({
        where: { id },
        data: {
          status: InvestigationStatus.UNDER_INVESTIGATION,
          ...(investigatorId && { investigatorId }),
        },
        include: INCLUDE,
      });
      await this.addLog(tx, id, userId, 'STARTED', 'Proses investigasi dimulai');
      return updated;
    });
  }

  // Tahap 3a: Kirim untuk approval (UNDER_INVESTIGATION → PENDING_APPROVAL)
  async submitForApproval(id: string, userId: string) {
    const inv = await this.findOne(id);
    if (inv.status !== InvestigationStatus.UNDER_INVESTIGATION) {
      throw new BadRequestException('Laporan harus berstatus UNDER_INVESTIGATION untuk dikirim approval');
    }
    if (!inv.rootCause || !inv.temuanInvestigasi || !inv.rekomendasiPerbaikan) {
      throw new BadRequestException('Lengkapi root cause, temuan, dan rekomendasi sebelum submit');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.investigation.update({
        where: { id },
        data: { status: InvestigationStatus.PENDING_APPROVAL },
        include: INCLUDE,
      });
      await this.addLog(tx, id, userId, 'SUBMITTED', 'Laporan dikirim untuk approval');
      return updated;
    });
  }

  // Tahap 3b: Approve (PENDING_APPROVAL → APPROVED)
  async approve(id: string, approverId: string, dto: SignApprovalDto) {
    const inv = await this.findOne(id);
    if (inv.status !== InvestigationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Investigasi tidak dalam status PENDING_APPROVAL');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.investigation.update({
        where: { id },
        data: {
          status:           InvestigationStatus.APPROVED,
          approvedById:     approverId,
          approvedAt:       new Date(),
          signatureApproval: dto.signatureApproval ?? null,
        },
        include: INCLUDE,
      });
      await this.addLog(tx, id, approverId, 'APPROVED', 'Laporan disetujui oleh atasan HSE');
      return updated;
    });
  }

  // Tahap 3c: Reject (PENDING_APPROVAL → REJECTED)
  async reject(id: string, userId: string, reason: string) {
    const inv = await this.findOne(id);
    if (inv.status !== InvestigationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Investigasi tidak dalam status PENDING_APPROVAL');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.investigation.update({
        where: { id },
        data: { status: InvestigationStatus.REJECTED },
        include: INCLUDE,
      });
      await this.addLog(tx, id, userId, 'REJECTED', `Laporan ditolak: ${reason}`);
      return updated;
    });
  }

  // Tahap 4: Tanda tangan korban (APPROVED → VICTIM_SIGNED)
  async signByVictim(id: string, userId: string, dto: SignVictimDto) {
    const inv = await this.findOne(id);
    if (inv.status !== InvestigationStatus.APPROVED) {
      throw new BadRequestException('Investigasi belum diapprove oleh atasan HSE');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.investigation.update({
        where: { id },
        data: {
          status:          InvestigationStatus.VICTIM_SIGNED,
          victimSignedAt:  new Date(),
          victimSignature: dto.victimSignature ?? null,
        },
        include: INCLUDE,
      });
      await this.addLog(tx, id, userId, 'VICTIM_SIGNED', 'Laporan ditandatangani oleh korban');
      return updated;
    });
  }

  // Tahap 5: Tanda tangan atasan korban (VICTIM_SIGNED → COMPLETED)
  async signBySupervisor(id: string, userId: string, dto: SignSupervisorDto) {
    const inv = await this.findOne(id);
    if (inv.status !== InvestigationStatus.VICTIM_SIGNED) {
      throw new BadRequestException('Laporan belum ditandatangani korban');
    }

    return this.prisma.$transaction(async (tx) => {
      // ── Otomatis buat Finding dari rekomendasi ─────────────────────────────
      let findingId: string | undefined;
      if (inv.rekomendasiPerbaikan && !inv.findingId) {
        const finding = await tx.finding.create({
          data: {
            subElementId:  'ap-incident',
            title:         `[Investigasi] ${inv.lokasi} - ${new Date(inv.tanggalKejadian).toLocaleDateString('id-ID')}`,
            findingStatus: 'INPG',
            data: {
              isFromInvestigation: true,
              investigationId: inv.id,
              rekomendasi: inv.rekomendasiPerbaikan,
              rootCause:   inv.rootCause,
              lokasi:      inv.lokasi,
              area:        inv.area,
            },
            createdById:   userId,
            createdByName: (await tx.user.findUnique({ where: { id: userId }, select: { nama: true } }))?.nama ?? 'System',
          },
        });
        findingId = finding.id;
      }

      const updated = await tx.investigation.update({
        where: { id },
        data: {
          status:              InvestigationStatus.COMPLETED,
          supervisorSignedAt:  new Date(),
          supervisorSignature: dto.supervisorSignature ?? null,
          supervisorNote:      dto.supervisorNote ?? null,
          ...(findingId && { findingId }),
        },
        include: INCLUDE,
      });

      await this.addLog(tx, id, userId, 'COMPLETED', 'Investigasi selesai, tanda tangan atasan korban diterima');
      return updated;
    });
  }

  // ── Delete (admin only) ───────────────────────────────────────────────────

  async remove(id: string, userId: string) {
    await this.findOne(id);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa menghapus data investigasi');
    }
    return this.prisma.investigation.delete({ where: { id } });
  }
}
