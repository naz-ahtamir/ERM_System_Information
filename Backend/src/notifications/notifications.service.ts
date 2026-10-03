import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        findingId: createNotificationDto.findingId ?? null,
        objekK3Id: createNotificationDto.objekK3Id ?? null,
        isRead: createNotificationDto.isRead ?? false,
      },
    });
  }

  /**
   * Ambil semua notifikasi milik userId, diurutkan dari terbaru.
   * @param userId  - ID user pemilik notifikasi
   * @param limit   - opsional, batasi jumlah yang dikembalikan
   */
  async findByUserId(userId: string, limit?: number): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      include: {
        finding: {
          select: {
            id: true,
            title: true,
            subElementId: true,
            findingStatus: true,
          },
        },
        objekK3: {
          select: {
            id: true,
            namaAlat: true,
            noSeri: true,
            tanggalBerlaku: true,
            statusRiksaUji: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
  }

  /**
   * Tandai satu notifikasi sebagai dibaca.
   * Validasi ownership: notifikasi harus milik userId yang diberikan.
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification dengan ID ${id} tidak ditemukan`,
      );
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke notifikasi ini',
      );
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Tandai semua notifikasi milik userId sebagai dibaca.
   */
  async markAllAsRead(
    userId: string,
  ): Promise<{ message: string; count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      message: 'Semua notifikasi berhasil ditandai sebagai dibaca',
      count: result.count,
    };
  }

  /**
   * Hitung notifikasi yang belum dibaca milik userId.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
