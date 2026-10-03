import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(centerId?: string) {
    return this.prisma.department.findMany({
      where: centerId ? { centerId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        center: { select: { id: true, name: true, code: true } },
        _count: { select: { divisions: true } },
      },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        center: { select: { id: true, name: true, code: true } },
        divisions: {
          orderBy: { name: 'asc' },
          include: { pic: { select: { id: true, idKaryawan: true, nama: true } } },
        },
      },
    });
    if (!dept) throw new NotFoundException(`Departemen dengan id ${id} tidak ditemukan`);
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Kode departemen "${dto.code}" sudah dipakai`);
    return this.prisma.department.create({
      data: { name: dto.name, code: dto.code, centerId: (dto as any).centerId ?? null },
      include: { center: { select: { id: true, name: true, code: true } } },
    });
  }

  async update(id: string, dto: Partial<CreateDepartmentDto> & { centerId?: string | null }) {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data: dto,
      include: { center: { select: { id: true, name: true, code: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const hasDivisions = await this.prisma.division.count({ where: { departmentId: id } });
    if (hasDivisions > 0)
      throw new ConflictException('Tidak bisa hapus: masih ada divisi yang terhubung');
    return this.prisma.department.delete({ where: { id } });
  }

  async upsertMany(dtos: CreateDepartmentDto[]) {
    let inserted = 0;
    let skipped = 0;

    for (const dto of dtos) {
      const existing = await this.prisma.department.findUnique({ where: { code: dto.code } });
      if (existing) {
        skipped++;
      } else {
        await this.prisma.department.create({ data: { name: dto.name, code: dto.code } });
        inserted++;
      }
    }

    const all = await this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { center: { select: { id: true, name: true, code: true } } },
    });
    return { inserted, skipped, total: all.length, departments: all };
  }
}
