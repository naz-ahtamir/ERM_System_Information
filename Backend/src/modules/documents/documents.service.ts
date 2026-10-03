import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto, JenisDokumen } from './dto/create-document.dto';

// Urutan level hierarki — index lebih kecil = level lebih tinggi
export const JENIS_ORDER = ['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'] as const;

const INCLUDE_FULL = {
  departemen: { select: { id: true, name: true, code: true } },
  parent: {
    select: { id: true, namaDokumen: true, nomorDokumen: true, jenisDokumen: true },
  },
  createdBy: { select: { id: true, nama: true } },
};

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // ── List flat ──────────────────────────────────────────────────────────────

  async findAll(filters?: { departemenId?: string; jenisDokumen?: string }) {
    return this.prisma.document.findMany({
      where: {
        ...(filters?.departemenId ? { departemenId: filters.departemenId } : {}),
        ...(filters?.jenisDokumen
          ? { jenisDokumen: filters.jenisDokumen as JenisDokumen }
          : {}),
      },
      include: INCLUDE_FULL,
      orderBy: [{ jenisDokumen: 'asc' }, { nomorDokumen: 'asc' }],
    });
  }

  // ── Tree per departemen ────────────────────────────────────────────────────

  async findTree(departemenId?: string) {
    const docs = await this.prisma.document.findMany({
      where: departemenId ? { departemenId } : {},
      include: { ...INCLUDE_FULL, children: { include: INCLUDE_FULL } },
      orderBy: [{ jenisDokumen: 'asc' }, { nomorDokumen: 'asc' }],
    });

    const roots = docs.filter(
      (d) => !d.parentId || !docs.find((p) => p.id === d.parentId),
    );

    const buildBranch = (node: any): any => ({
      ...node,
      children: docs
        .filter((d) => d.parentId === node.id)
        .sort((a, b) => a.nomorDokumen.localeCompare(b.nomorDokumen))
        .map(buildBranch),
    });

    return roots.map(buildBranch);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  async getStats() {
    const [total, byJenis, byStatus, byDept] = await Promise.all([
      this.prisma.document.count(),
      this.prisma.document.groupBy({ by: ['jenisDokumen'], _count: true }),
      this.prisma.document.groupBy({ by: ['statusValidasi'], _count: true }),
      this.prisma.document.groupBy({
        by: ['departemenId'],
        _count: true,
        orderBy: { _count: { departemenId: 'desc' } },
      }),
    ]);

    return { total, byJenis, byStatus, byDept };
  }

  // ── Single ─────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        ...INCLUDE_FULL,
        children: {
          include: INCLUDE_FULL,
          orderBy: { nomorDokumen: 'asc' },
        },
      },
    });
    if (!doc) throw new NotFoundException(`Dokumen ${id} tidak ditemukan`);
    return doc;
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  async create(dto: CreateDocumentDto, userId: string, fileUrl?: string) {
    if (dto.parentId) {
      const parentDoc = await this.prisma.document.findUnique({
        where: { id: dto.parentId },
      });
      if (!parentDoc) throw new BadRequestException('Dokumen parent tidak ditemukan');

      const parentLevel = JENIS_ORDER.indexOf(parentDoc.jenisDokumen as any);
      const childLevel  = JENIS_ORDER.indexOf(dto.jenisDokumen as any);
      if (childLevel <= parentLevel) {
        throw new BadRequestException(
          'Parent harus memiliki level hierarki lebih tinggi (MANUAL > SOP > IK > Formulir)',
        );
      }
    }

    return this.prisma.document.create({
      data: {
        departemenId:     dto.departemenId,
        jenisDokumen:     dto.jenisDokumen,
        namaDokumen:      dto.namaDokumen,
        nomorDokumen:     dto.nomorDokumen,
        revisi:           dto.revisi ?? '00',
        tanggalTerbit:    new Date(dto.tanggalTerbit),
        statusDokumen:    dto.statusDokumen,
        statusDistribusi: dto.statusDistribusi,
        statusValidasi:   dto.statusValidasi,
        parentId:         dto.parentId ?? null,
        fileUrl:          fileUrl ?? null,
        createdById:      userId,
      },
      include: INCLUDE_FULL,
    });
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  async update(id: string, dto: Partial<CreateDocumentDto>, fileUrl?: string) {
    const existing = await this.findOne(id);

    if (dto.parentId !== undefined && dto.parentId !== existing.parentId) {
      if (dto.parentId) {
        const parentDoc = await this.prisma.document.findUnique({
          where: { id: dto.parentId },
        });
        if (!parentDoc) throw new BadRequestException('Dokumen parent tidak ditemukan');

        const targetJenis = (dto.jenisDokumen ?? existing.jenisDokumen) as any;
        const parentLevel = JENIS_ORDER.indexOf(parentDoc.jenisDokumen as any);
        const childLevel  = JENIS_ORDER.indexOf(targetJenis);
        if (childLevel <= parentLevel) {
          throw new BadRequestException(
            'Parent harus memiliki level hierarki lebih tinggi',
          );
        }
      }
    }

    const data: any = {};
    if (dto.departemenId     !== undefined) data.departemenId     = dto.departemenId;
    if (dto.jenisDokumen     !== undefined) data.jenisDokumen     = dto.jenisDokumen;
    if (dto.namaDokumen      !== undefined) data.namaDokumen      = dto.namaDokumen;
    if (dto.nomorDokumen     !== undefined) data.nomorDokumen     = dto.nomorDokumen;
    if (dto.revisi           !== undefined) data.revisi           = dto.revisi;
    if (dto.tanggalTerbit    !== undefined) data.tanggalTerbit    = new Date(dto.tanggalTerbit);
    if (dto.statusDokumen    !== undefined) data.statusDokumen    = dto.statusDokumen;
    if (dto.statusDistribusi !== undefined) data.statusDistribusi = dto.statusDistribusi;
    if (dto.statusValidasi   !== undefined) data.statusValidasi   = dto.statusValidasi;
    if (dto.parentId         !== undefined) data.parentId         = dto.parentId || null;
    if (fileUrl              !== undefined) data.fileUrl          = fileUrl;

    return this.prisma.document.update({
      where: { id },
      data,
      include: INCLUDE_FULL,
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.document.updateMany({
      where: { parentId: id },
      data:  { parentId: null },
    });
    return this.prisma.document.delete({ where: { id } });
  }
}
