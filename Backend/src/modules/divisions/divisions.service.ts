import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDivisionDto, UpdateDivisionDto } from './dto/create-division.dto';

const PIC_SELECT  = { id: true, idKaryawan: true, nama: true, jabatan: true } as const;
const DEPT_SELECT = {
  id: true, name: true, code: true, centerId: true,
  center: { select: { id: true, name: true, code: true } },
} as const;

@Injectable()
export class DivisionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    return this.prisma.division.findMany({
      where: departmentId ? { departmentId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        department: { select: DEPT_SELECT },
        pic: { select: PIC_SELECT },
      },
    });
  }

  async findOne(id: string) {
    const div = await this.prisma.division.findUnique({
      where: { id },
      include: {
        department: { select: DEPT_SELECT },
        pic: { select: PIC_SELECT },
      },
    });
    if (!div) throw new NotFoundException(`Division ${id} tidak ditemukan`);
    return div;
  }

  async create(dto: CreateDivisionDto) {
    const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!dept) throw new NotFoundException(`Department ${dto.departmentId} tidak ditemukan`);
    const pic = await this.prisma.user.findUnique({ where: { id: dto.picId } });
    if (!pic) throw new NotFoundException(`User PIC ${dto.picId} tidak ditemukan`);
    return this.prisma.division.create({
      data: dto,
      include: {
        department: { select: DEPT_SELECT },
        pic: { select: PIC_SELECT },
      },
    });
  }

  async update(id: string, dto: UpdateDivisionDto) {
    await this.findOne(id);
    if (dto.departmentId) {
      const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
      if (!dept) throw new NotFoundException(`Department ${dto.departmentId} tidak ditemukan`);
    }
    if (dto.picId) {
      const pic = await this.prisma.user.findUnique({ where: { id: dto.picId } });
      if (!pic) throw new NotFoundException(`User PIC ${dto.picId} tidak ditemukan`);
    }
    return this.prisma.division.update({
      where: { id },
      data: dto,
      include: {
        department: { select: DEPT_SELECT },
        pic: { select: PIC_SELECT },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const hasUsers = await this.prisma.user.count({ where: { divisionId: id } });
    if (hasUsers > 0)
      throw new ConflictException('Tidak bisa hapus: masih ada user yang terhubung ke divisi ini');
    return this.prisma.division.delete({ where: { id } });
  }
}
