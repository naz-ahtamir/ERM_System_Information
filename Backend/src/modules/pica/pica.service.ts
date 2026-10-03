import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreatePicaDto } from './dto/create-pica.dto';
import { UpdatePicaDto } from './dto/update-pica.dto';
import { StatusPerbaikanPica, Prisma, ApprovalActionPica, KategoriPica, JenisTemuan } from '@prisma/client';

// ── Prisma include ─────────────────────────────────────────────────────────

const INCLUDE = {
  files: true,
  riwayatApproval: { orderBy: { tanggal: 'asc' as const } },
} satisfies Prisma.PicaInclude;

// ── Types ──────────────────────────────────────────────────────────────────

export interface PicaFilters {
  divisiId?: string;
  status?: string;
  kategori?: string;
  search?: string;
  tanggalDari?: string;
  tanggalSampai?: string;
}

@Injectable()
export class PicaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  // ── GET all ────────────────────────────────────────────────────────────────

  async findAll(filters: PicaFilters = {}) {
    const where: Prisma.PicaWhereInput = {};

    if (filters.divisiId) {
      where.OR = [
        { lokasiDivisiId: filters.divisiId },
        { divisiId: filters.divisiId },
      ];
    }

    if (filters.status && Object.values(StatusPerbaikanPica).includes(filters.status as StatusPerbaikanPica)) {
      where.statusPerbaikan = filters.status as StatusPerbaikanPica;
    }

    if (filters.kategori && Object.values(KategoriPica).includes(filters.kategori as KategoriPica)) {
      where.kategori = filters.kategori as KategoriPica;
    }

    if (filters.tanggalDari) {
      where.tanggalTemuan = { ...where.tanggalTemuan as any, gte: new Date(filters.tanggalDari) };
    }
    if (filters.tanggalSampai) {
      where.tanggalTemuan = { ...where.tanggalTemuan as any, lte: new Date(filters.tanggalSampai) };
    }

    if (filters.search) {
      const q = filters.search;
      where.OR = [
        ...(where.OR ?? []),
        { temuanMasalah: { contains: q, mode: 'insensitive' } },
        { kriteriaDeskripsi: { contains: q, mode: 'insensitive' } },
        { lokasiDivisiNama: { contains: q, mode: 'insensitive' } },
        { picNama: { contains: q, mode: 'insensitive' } },
        { rekomendasiPerbaikan: { contains: q, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.pica.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return records.map(this.toRecord);
  }

  // ── GET one ────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const record = await this.prisma.pica.findUnique({ where: { id }, include: INCLUDE });
    if (!record) throw new NotFoundException(`PICA dengan ID ${id} tidak ditemukan`);
    return this.toRecord(record);
  }

  // ── CREATE ─────────────────────────────────────────────────────────────────

  async create(
    dto: CreatePicaDto,
    files: {
      dokumentasiTemuan?: Express.Multer.File[];
    } = {},
  ) {
    // Upload dokumentasi temuan ke Supabase
    const fileRecords: { fieldName: string; fileName: string; fileUrl: string; fileSize: number }[] = [];

    for (const file of files.dokumentasiTemuan ?? []) {
      const url = await this.storage.upload(file.buffer, file.originalname, file.mimetype, 'pica');
      fileRecords.push({
        fieldName: 'dokumentasiTemuan',
        fileName: file.originalname,
        fileUrl: url,
        fileSize: file.size,
      });
    }

    const record = await this.prisma.pica.create({
      data: {
        temuanMasalah: dto.temuanMasalah,
        kriteriaId: dto.kriteriaId,
        kriteriaDeskripsi: dto.kriteriaDeskripsi,
        kategori: dto.kategori,
        lokasiDivisiId: dto.lokasiDivisiId,
        lokasiDivisiNama: dto.lokasiDivisiNama,
        dokumentasiTemuanTeks: dto.dokumentasiTemuanTeks,
        tanggalTemuan: new Date(dto.tanggalTemuan),
        jenisTemuan: dto.jenisTemuan,
        hierarkiPengendalian: dto.hierarkiPengendalian,
        rekomendasiPerbaikan: dto.rekomendasiPerbaikan,
        picId: dto.picId,
        picNama: dto.picNama,
        divisiId: dto.divisiId,
        batasAkhir: new Date(dto.batasAkhir),
        statusPerbaikan: StatusPerbaikanPica.OPEN,
        createdBy: dto.createdBy ?? 'Admin',
        createdById: dto.createdById,
        files: {
          create: fileRecords,
        },
      },
      include: INCLUDE,
    });

    return this.toRecord(record);
  }

  // ── UPDATE (hanya OPEN) ────────────────────────────────────────────────────

  async update(
    id: string,
    dto: UpdatePicaDto,
    files: { dokumentasiTemuan?: Express.Multer.File[] } = {},
  ) {
    const existing = await this.prisma.pica.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`PICA ${id} tidak ditemukan`);
    if (existing.statusPerbaikan !== StatusPerbaikanPica.OPEN) {
      throw new BadRequestException('Hanya record berstatus OPEN yang dapat diedit');
    }

    // Upload file dokumentasi tambahan
    for (const file of files.dokumentasiTemuan ?? []) {
      const url = await this.storage.upload(file.buffer, file.originalname, file.mimetype, 'pica');
      await this.prisma.picaFile.create({
        data: {
          picaId: id,
          fieldName: 'dokumentasiTemuan',
          fileName: file.originalname,
          fileUrl: url,
          fileSize: file.size,
        },
      });
    }

    const updated = await this.prisma.pica.update({
      where: { id },
      data: {
        ...(dto.temuanMasalah && { temuanMasalah: dto.temuanMasalah }),
        ...(dto.kriteriaId && { kriteriaId: dto.kriteriaId }),
        ...(dto.kriteriaDeskripsi !== undefined && { kriteriaDeskripsi: dto.kriteriaDeskripsi }),
        ...(dto.kategori && { kategori: dto.kategori }),
        ...(dto.lokasiDivisiId && { lokasiDivisiId: dto.lokasiDivisiId }),
        ...(dto.lokasiDivisiNama !== undefined && { lokasiDivisiNama: dto.lokasiDivisiNama }),
        ...(dto.dokumentasiTemuanTeks !== undefined && { dokumentasiTemuanTeks: dto.dokumentasiTemuanTeks }),
        ...(dto.tanggalTemuan && { tanggalTemuan: new Date(dto.tanggalTemuan) }),
        ...(dto.jenisTemuan && { jenisTemuan: dto.jenisTemuan }),
        ...(dto.hierarkiPengendalian && { hierarkiPengendalian: dto.hierarkiPengendalian }),
        ...(dto.rekomendasiPerbaikan && { rekomendasiPerbaikan: dto.rekomendasiPerbaikan }),
        ...(dto.picId && { picId: dto.picId }),
        ...(dto.picNama && { picNama: dto.picNama }),
        ...(dto.divisiId && { divisiId: dto.divisiId }),
        ...(dto.batasAkhir && { batasAkhir: new Date(dto.batasAkhir) }),
      },
      include: INCLUDE,
    });

    return this.toRecord(updated);
  }

  // ── ACTION: submit_perbaikan | approve | reject | set_in_progress ──────────

  async action(params: {
    id: string;
    action: string;
    keterangan?: string;
    oleh?: string;
    files?: { dokumentasiPerbaikan?: Express.Multer.File[] };
  }) {
    const { id, keterangan, oleh } = params;
    const record = await this.prisma.pica.findUnique({ where: { id }, include: INCLUDE });
    if (!record) throw new NotFoundException(`PICA ${id} tidak ditemukan`);

    const now = new Date();

    // ── set_in_progress ──────────────────────────────────────────────────────
    if (params.action === 'set_in_progress') {
      if (record.statusPerbaikan === StatusPerbaikanPica.CLSD) {
        throw new BadRequestException('Record sudah ditutup (CLSD)');
      }
      const updated = await this.prisma.pica.update({
        where: { id },
        data: {
          statusPerbaikan: StatusPerbaikanPica.IN_PROGRESS,
          riwayatApproval: {
            create: {
              tanggal: now,
              oleh: oleh ?? 'Admin',
              action: ApprovalActionPica.ACC,
              keterangan: keterangan ?? 'Admin mengubah status ke In Progress',
            },
          },
        },
        include: INCLUDE,
      });
      return this.toRecord(updated);
    }

    // ── submit_perbaikan ─────────────────────────────────────────────────────
    if (params.action === 'submit_perbaikan') {
      if (record.statusPerbaikan === StatusPerbaikanPica.CLSD) {
        throw new BadRequestException('Record sudah ditutup (CLSD)');
      }

      // Upload bukti perbaikan
      for (const file of params.files?.dokumentasiPerbaikan ?? []) {
        const url = await this.storage.upload(file.buffer, file.originalname, file.mimetype, 'pica');
        await this.prisma.picaFile.create({
          data: {
            picaId: id,
            fieldName: 'dokumentasiPerbaikan',
            fileName: file.originalname,
            fileUrl: url,
            fileSize: file.size,
          },
        });
      }

      const updated = await this.prisma.pica.update({
        where: { id },
        data: { statusPerbaikan: StatusPerbaikanPica.IN_PROGRESS },
        include: INCLUDE,
      });
      return this.toRecord(updated);
    }

    // ── approve ──────────────────────────────────────────────────────────────
    if (params.action === 'approve') {
      if (record.statusPerbaikan !== StatusPerbaikanPica.IN_PROGRESS) {
        throw new BadRequestException('Hanya record IN_PROGRESS yang bisa di-ACC');
      }
      const updated = await this.prisma.pica.update({
        where: { id },
        data: {
          statusPerbaikan: StatusPerbaikanPica.CLSD,
          tanggalPerbaikan: now,
          catatanTACC: null,
          riwayatApproval: {
            create: {
              tanggal: now,
              oleh: oleh ?? 'Admin',
              action: ApprovalActionPica.ACC,
              keterangan,
            },
          },
        },
        include: INCLUDE,
      });
      return this.toRecord(updated);
    }

    // ── reject (TACC) → status kembali ke OPEN ───────────────────────────────
    if (params.action === 'reject') {
      if (record.statusPerbaikan !== StatusPerbaikanPica.IN_PROGRESS) {
        throw new BadRequestException('Hanya record IN_PROGRESS yang bisa di-TACC');
      }
      if (!keterangan?.trim()) {
        throw new BadRequestException('Keterangan wajib diisi saat TACC');
      }
      const updated = await this.prisma.pica.update({
        where: { id },
        data: {
          statusPerbaikan: StatusPerbaikanPica.OPEN, // kembali ke OPEN agar user bisa revisi
          catatanTACC: keterangan,
          riwayatApproval: {
            create: {
              tanggal: now,
              oleh: oleh ?? 'Admin',
              action: ApprovalActionPica.TACC,
              keterangan,
            },
          },
        },
        include: INCLUDE,
      });
      return this.toRecord(updated);
    }

    throw new BadRequestException(`Action tidak dikenal: ${params.action}`);
  }

  // ── updateStatus (direct status change) ───────────────────────────────────

  async updateStatus(id: string, statusInput: string, keterangan?: string) {
    const record = await this.prisma.pica.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`PICA ${id} tidak ditemukan`);

    // Map frontend string INPG → Prisma enum IN_PROGRESS
    const statusMap: Record<string, StatusPerbaikanPica> = {
      INPG: StatusPerbaikanPica.IN_PROGRESS,
      IN_PROGRESS: StatusPerbaikanPica.IN_PROGRESS,
      OPEN: StatusPerbaikanPica.OPEN,
      CLSD: StatusPerbaikanPica.CLSD,
    };
    const status = statusMap[statusInput] ?? (statusInput as StatusPerbaikanPica);

    const updated = await this.prisma.pica.update({
      where: { id },
      data: {
        statusPerbaikan: status,
        ...(status === StatusPerbaikanPica.CLSD && { tanggalPerbaikan: new Date() }),
      },
      include: INCLUDE,
    });
    return this.toRecord(updated);
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────

  async remove(id: string) {
    const record = await this.prisma.pica.findUnique({ where: { id }, include: { files: true } });
    if (!record) throw new NotFoundException(`PICA ${id} tidak ditemukan`);

    // Hapus file dari Supabase
    for (const file of record.files) {
      await this.storage.delete(file.fileUrl).catch(() => {});
    }

    await this.prisma.pica.delete({ where: { id } });
    return { message: 'Record berhasil dihapus' };
  }

  // ── toRecord: shape yang sama dengan frontend PicaRecord ──────────────────
  // Mapping: DB enum IN_PROGRESS → frontend string INPG

  private toRecord(pica: any) {
    // Map Prisma enum IN_PROGRESS → frontend string INPG
    const statusMap: Record<string, string> = {
      IN_PROGRESS: 'INPG',
      OPEN: 'OPEN',
      CLSD: 'CLSD',
    };
    const status = statusMap[pica.statusPerbaikan] ?? pica.statusPerbaikan;

    // Map Prisma JenisTemuan enum key → display value
    const jenisTemuanMap: Record<string, string> = {
      KONDISI_TIDAK_AMAN:  'Kondisi Tidak Aman',
      TINDAKAN_TIDAK_AMAN: 'Tindakan Tidak Aman',
      HAMPIR_CELAKA:       'Hampir Celaka',
      KETIDAKSESUAIAN:     'Ketidaksesuaian',
    };
    const jenisTemuan = jenisTemuanMap[pica.jenisTemuan] ?? pica.jenisTemuan;

    return {
      id: pica.id,
      temuanMasalah: pica.temuanMasalah,
      kriteriaId: pica.kriteriaId,
      kriteriaDeskripsi: pica.kriteriaDeskripsi,
      kategori: pica.kategori,
      lokasiDivisiId: pica.lokasiDivisiId,
      lokasiDivisiNama: pica.lokasiDivisiNama,
      dokumentasiTemuanTeks: pica.dokumentasiTemuanTeks,
      dokumentasiTemuanFiles: (pica.files ?? [])
        .filter((f: any) => f.fieldName === 'dokumentasiTemuan')
        .map((f: any) => ({
          fieldName: f.fieldName,
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize,
          uploadedAt: f.uploadedAt?.toISOString(),
        })),
      tanggalTemuan: pica.tanggalTemuan?.toISOString().slice(0, 10),
      jenisTemuan: jenisTemuan,
      hierarkiPengendalian: pica.hierarkiPengendalian,
      rekomendasiPerbaikan: pica.rekomendasiPerbaikan,
      picId: pica.picId,
      picNama: pica.picNama,
      divisiId: pica.divisiId,
      batasAkhir: pica.batasAkhir?.toISOString().slice(0, 10),
      statusPerbaikan: status,
      tanggalPerbaikan: pica.tanggalPerbaikan?.toISOString().slice(0, 10) ?? null,
      catatanTACC: pica.catatanTACC ?? null,
      dokumentasiPerbaikanFiles: (pica.files ?? [])
        .filter((f: any) => f.fieldName === 'dokumentasiPerbaikan')
        .map((f: any) => ({
          fieldName: f.fieldName,
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize,
          uploadedAt: f.uploadedAt?.toISOString(),
        })),
      riwayatApproval: (pica.riwayatApproval ?? []).map((a: any) => ({
        tanggal: a.tanggal?.toISOString(),
        oleh: a.oleh,
        action: a.action,
        keterangan: a.keterangan,
      })),
      createdBy: pica.createdBy,
      createdById: pica.createdById,
      createdAt: pica.createdAt?.toISOString(),
      updatedAt: pica.updatedAt?.toISOString(),
    };
  }
}
