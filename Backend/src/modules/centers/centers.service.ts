import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/create-center.dto';

@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.center.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { departments: true } },
      },
    });
  }

  async findOne(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: {
        departments: {
          orderBy: { name: 'asc' },
          include: { _count: { select: { divisions: true } } },
        },
      },
    });
    if (!center) throw new NotFoundException(`Center ${id} tidak ditemukan`);
    return center;
  }

  async create(dto: CreateCenterDto) {
    const exists = await this.prisma.center.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Kode '${dto.code}' sudah dipakai`);
    return this.prisma.center.create({ data: dto });
  }

  async update(id: string, dto: UpdateCenterDto) {
    await this.findOne(id);
    if (dto.code) {
      const exists = await this.prisma.center.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (exists) throw new ConflictException(`Kode '${dto.code}' sudah dipakai`);
    }
    return this.prisma.center.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const hasDepts = await this.prisma.department.count({ where: { centerId: id } });
    if (hasDepts > 0)
      throw new ConflictException('Tidak bisa hapus: masih ada departemen yang terhubung ke pusat ini');
    return this.prisma.center.delete({ where: { id } });
  }
}
