import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateObjekK3Dto } from './dto/create-objek-k3.dto';
import { UpdateObjekK3Dto } from './dto/update-objek-k3.dto';
import { CreateRiwayatDto } from './dto/create-riwayat.dto';
import { Prisma } from '@prisma/client';

// Fields that hold ISO date strings and need to be coerced to Date objects
const DATE_FIELDS = [
  'tanggalPengujianPertama',
  'tanggalPengujianBerkala',
  'tanggalRiksaUjiTerakhir',
  'tanggalBerlaku',
  'jadwalRiksaUji',
] as const;

function toDate(v: string | undefined): Date | undefined {
  return v ? new Date(v) : undefined;
}

/** Auto-calculate sisaHari from tanggalBerlaku */
function calcSisaHari(tanggalBerlaku?: Date | null): number | null {
  if (!tanggalBerlaku) return null;
  const diff = tanggalBerlaku.getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const INCLUDE = {
  departemen: { select: { id: true, name: true, code: true } },
  createdBy: { select: { id: true, nama: true } },
  updatedBy: { select: { id: true, nama: true } },
  riwayatPemeriksaan: { orderBy: { tanggal: 'desc' as const } },
} satisfies Prisma.ObjekK3Include;

@Injectable()
export class ObjekK3Service {
  constructor(private prisma: PrismaService) {}

  // ── Helpers ────────────────────────────────────────────────────────────

  private buildData(dto: Partial<CreateObjekK3Dto>) {
    const berlaku = dto.tanggalBerlaku ? new Date(dto.tanggalBerlaku) : undefined;
    const sisaHari = berlaku !== undefined ? calcSisaHari(berlaku) : undefined;

    return {
      ...(dto.perusahaan !== undefined && { perusahaan: dto.perusahaan }),
      ...(dto.kategori !== undefined && { kategori: dto.kategori }),
      ...(dto.namaAlat !== undefined && { namaAlat: dto.namaAlat }),
      ...(dto.noSeri !== undefined && { noSeri: dto.noSeri }),
      ...(dto.jumlah !== undefined && { jumlah: Number(dto.jumlah) }),
      ...(dto.departemenId !== undefined && { departemenId: dto.departemenId }),
      ...(dto.lokasi !== undefined && { lokasi: dto.lokasi }),
      ...(dto.kapasitas !== undefined && { kapasitas: dto.kapasitas !== null ? Number(dto.kapasitas) : null }),
      ...(dto.satuan !== undefined && { satuan: dto.satuan }),
      ...(dto.tahunPemasangan !== undefined && { tahunPemasangan: dto.tahunPemasangan !== null ? Number(dto.tahunPemasangan) : null }),
      ...(dto.kondisiPemasangan !== undefined && { kondisiPemasangan: dto.kondisiPemasangan }),
      ...(dto.pengesahanGambar !== undefined && { pengesahanGambar: dto.pengesahanGambar }),
      ...(dto.tanggalPengujianPertama !== undefined && { tanggalPengujianPertama: toDate(dto.tanggalPengujianPertama) }),
      ...(dto.tanggalPengujianBerkala !== undefined && { tanggalPengujianBerkala: toDate(dto.tanggalPengujianBerkala) }),
      ...(dto.statusKelayakan !== undefined && { statusKelayakan: dto.statusKelayakan }),
      ...(dto.statusRiksaUji !== undefined && { statusRiksaUji: dto.statusRiksaUji }),
      ...(dto.noSuket !== undefined && { noSuket: dto.noSuket }),
      ...(dto.tanggalRiksaUjiTerakhir !== undefined && { tanggalRiksaUjiTerakhir: toDate(dto.tanggalRiksaUjiTerakhir) }),
      ...(berlaku !== undefined && { tanggalBerlaku: berlaku }),
      ...(sisaHari !== undefined && { sisaHari }),
      ...(dto.statusAman !== undefined && { statusAman: dto.statusAman }),
      ...(dto.jadwalRiksaUji !== undefined && { jadwalRiksaUji: toDate(dto.jadwalRiksaUji) }),
      ...(dto.lhu !== undefined && { lhu: dto.lhu }),
      ...(dto.fileLHU !== undefined && { fileLHU: dto.fileLHU }),
      ...(dto.lhuAda !== undefined && { lhuAda: dto.lhuAda }),
      ...(dto.noLHU !== undefined && { noLHU: dto.noLHU }),
      ...(dto.fotoAlat !== undefined && { fotoAlat: dto.fotoAlat }),
      ...(dto.fotoTagging !== undefined && { fotoTagging: dto.fotoTagging }),
      ...(dto.sertifikat !== undefined && { sertifikat: dto.sertifikat }),
      ...(dto.laporanPemeriksaan !== undefined && { laporanPemeriksaan: dto.laporanPemeriksaan }),
      ...(dto.catatan !== undefined && { catatan: dto.catatan }),
    };
  }

  // ── CRUD ───────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateObjekK3Dto) {
    const data = this.buildData(dto);
    return this.prisma.objekK3.create({
      data: { ...data, createdById: userId } as any,
      include: INCLUDE,
    });
  }

  async findAll(filters: {
    perusahaan?: string;
    kategori?: string;
    statusKelayakan?: string;
    statusRiksaUji?: string;
    statusAman?: string;
    search?: string;
  }) {
    const where: Prisma.ObjekK3WhereInput = {};

    if (filters.perusahaan) where.perusahaan = filters.perusahaan as any;
    if (filters.kategori) where.kategori = filters.kategori as any;
    if (filters.statusKelayakan) where.statusKelayakan = filters.statusKelayakan as any;
    if (filters.statusRiksaUji) where.statusRiksaUji = filters.statusRiksaUji as any;
    if (filters.statusAman) where.statusAman = filters.statusAman as any;

    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { namaAlat: { contains: q, mode: 'insensitive' } },
        { noSeri: { contains: q, mode: 'insensitive' } },
        { lokasi: { contains: q, mode: 'insensitive' } },
        { noSuket: { contains: q, mode: 'insensitive' } },
        { noLHU: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.objekK3.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: INCLUDE,
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.objekK3.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!record) throw new NotFoundException('Objek K3 tidak ditemukan');
    return record;
  }

  async update(id: string, userId: string, dto: UpdateObjekK3Dto) {
    await this.findOne(id);
    const data = this.buildData(dto);
    return this.prisma.objekK3.update({
      where: { id },
      data: { ...data, updatedById: userId } as any,
      include: INCLUDE,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa menghapus objek K3');
    }
    return this.prisma.objekK3.delete({ where: { id } });
  }

  // ── Riwayat Pemeriksaan ────────────────────────────────────────────────

  async addRiwayat(objekK3Id: string, dto: CreateRiwayatDto) {
    await this.findOne(objekK3Id);
    return this.prisma.riwayatPemeriksaan.create({
      data: {
        objekK3Id,
        tanggal: new Date(dto.tanggal),
        hasil: dto.hasil,
        catatan: dto.catatan,
        fileLaporan: dto.fileLaporan,
      },
    });
  }

  async removeRiwayat(riwayatId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa menghapus riwayat');
    }
    return this.prisma.riwayatPemeriksaan.delete({ where: { id: riwayatId } });
  }

  /** Recalculate sisaHari for all records — called by scheduler */
  async refreshSisaHari() {
    const all = await this.prisma.objekK3.findMany({
      select: { id: true, tanggalBerlaku: true },
    });
    const ops = all
      .filter((r) => r.tanggalBerlaku !== null)
      .map((r) =>
        this.prisma.objekK3.update({
          where: { id: r.id },
          data: { sisaHari: calcSisaHari(r.tanggalBerlaku) },
        }),
      );
    return this.prisma.$transaction(ops);
  }
}
