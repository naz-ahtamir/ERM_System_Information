import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateK3PolicyDto } from './dto/create-k3-policy.dto';
import { UpdateK3PolicyDto } from './dto/update-k3-policy.dto';

@Injectable()
export class K3PolicyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateK3PolicyDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nama: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    return this.prisma.k3Policy.create({
      data: {
        jenisKebijakan: dto.jenisKebijakan,
        judulKebijakan: dto.judulKebijakan,
        tanggalPenetapan: new Date(dto.tanggalPenetapan),
        penandatangan: dto.penandatangan,
        jabatan: dto.jabatan,
        statusDokumen: dto.statusDokumen,
        statusDistribusi: dto.statusDistribusi,
        statusValidasi: dto.statusValidasi,
        fileUrl: dto.fileUrl,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, nama: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.k3Policy.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, nama: true } },
      },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.k3Policy.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, nama: true } },
      },
    });
    if (!record) throw new NotFoundException('K3 Policy tidak ditemukan');
    return record;
  }

  async update(id: string, userId: string, dto: UpdateK3PolicyDto) {
    await this.findOne(id);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nama: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const updateData: any = {};
    if (dto.jenisKebijakan !== undefined) updateData.jenisKebijakan = dto.jenisKebijakan;
    if (dto.judulKebijakan !== undefined) updateData.judulKebijakan = dto.judulKebijakan;
    if (dto.tanggalPenetapan !== undefined) updateData.tanggalPenetapan = new Date(dto.tanggalPenetapan);
    if (dto.penandatangan !== undefined) updateData.penandatangan = dto.penandatangan;
    if (dto.jabatan !== undefined) updateData.jabatan = dto.jabatan;
    if (dto.statusDokumen !== undefined) updateData.statusDokumen = dto.statusDokumen;
    if (dto.statusDistribusi !== undefined) updateData.statusDistribusi = dto.statusDistribusi;
    if (dto.statusValidasi !== undefined) updateData.statusValidasi = dto.statusValidasi;
    if (dto.fileUrl !== undefined) updateData.fileUrl = dto.fileUrl;
    updateData.updatedById = userId;

    return this.prisma.k3Policy.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, nama: true } },
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa menghapus');
    }
    return this.prisma.k3Policy.delete({ where: { id } });
  }
}