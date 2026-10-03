import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Finding, User } from '@prisma/client';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { UpdateFindingStatusDto } from './dto/update-finding-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FindingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createFindingDto: CreateFindingDto,
    createdById: string,
    creator: User,
    uploadedFiles?: Record<string, { originalname: string; fileUrl: string; size: number; mimetype: string }[]>,
  ): Promise<Finding> {
    const finding = await this.prisma.finding.create({
      data: {
        subElementId: createFindingDto.subElementId,
        title: createFindingDto.title,
        data: createFindingDto.data ?? {},
        createdById,
        createdByName: creator.nama,
        findingStatus: (createFindingDto.findingStatus ?? 'INPG') as any,
      },
    });

    // Simpan file yang diupload ke tabel FindingFile (URL sudah dari Supabase)
    if (uploadedFiles) {
      for (const [fieldName, files] of Object.entries(uploadedFiles)) {
        for (const file of files) {
          await this.prisma.findingFile.create({
            data: {
              findingId: finding.id,
              fieldName,
              fileName: file.originalname,
              fileUrl: file.fileUrl,
              fileSize: file.size,
              mimeType: file.mimetype,
            },
          });
        }
      }
    }

    // ── Kirim notifikasi ke supervisor user ──
    // Kumpulkan target supervisor/admin
    const supervisorTargetIds: string[] = [];
    if (creator.supervisorId) {
      supervisorTargetIds.push(creator.supervisorId);
    } else {
      // Fallback: kirim ke semua supervisor/admin jika user tidak punya supervisor
      const supervisors = await this.prisma.user.findMany({
        where: { role: { in: ['supervisor', 'admin'] as any[] }, approved: true },
        select: { id: true },
      });
      supervisorTargetIds.push(...supervisors.map((s) => s.id));
    }

    for (const userId of supervisorTargetIds) {
      // finding_submitted: informasi temuan baru
      await this.notificationsService.create({
        userId,
        type: 'finding_submitted',
        title: 'Temuan Baru Dilaporkan',
        message: `${creator.nama} melaporkan temuan baru: "${finding.title}". Harap ditinjau.`,
        findingId: finding.id,
        isRead: false,
      });

      // approval_required: butuh tindakan persetujuan
      await this.notificationsService.create({
        userId,
        type: 'approval_required',
        title: 'Butuh Persetujuan Supervisor',
        message: `Finding "${finding.title}" oleh ${creator.nama} memerlukan persetujuan Anda sebelum PIC dapat ditugaskan.`,
        findingId: finding.id,
        isRead: false,
      });
    }

    // Return finding dengan files
    return this.prisma.finding.findUnique({
      where: { id: finding.id },
      include: { createdBy: true, approvedBy: true, files: true },
    }) as Promise<Finding>;
  }

  async findAll(filters: {
    findingStatus?: string;
    subElementId?: string;
    createdById?: string;
    departemen?: string;
  }): Promise<Finding[]> {
    const where: any = {
      deletedAt: null,
    };

    if (filters.findingStatus) {
      where.findingStatus = filters.findingStatus;
    }

    if (filters.subElementId) {
      where.subElementId = filters.subElementId;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.departemen) {
      where.createdBy = {
        departemen: filters.departemen,
      };
    }

    return this.prisma.finding.findMany({
      where,
      include: {
        createdBy: true,
        approvedBy: true,
        files: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Finding> {
    const finding = await this.prisma.finding.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        createdBy: true,
        approvedBy: true,
        files: true,
      },
    });

    if (!finding) {
      throw new NotFoundException(`Finding dengan ID ${id} tidak ditemukan`);
    }

    return finding;
  }

  async update(
    id: string,
    updateFindingDto: UpdateFindingDto,
  ): Promise<Finding> {
    await this.findOne(id);

    return this.prisma.finding.update({
      where: { id },
      data: updateFindingDto,
      include: {
        createdBy: true,
        approvedBy: true,
        files: true,
      },
    });
  }

  /**
   * Update finding beserta file-nya.
   * - File yang tidak diupload ulang TETAP ada (tidak dihapus).
   * - File yang diupload ulang akan menggantikan entri lama untuk fieldName yang sama.
   */
  async updateWithFiles(
    id: string,
    updateFindingDto: UpdateFindingDto,
    uploadedFiles?: Record<string, { originalname: string; fileUrl: string; size: number; mimetype: string }[]>,
  ): Promise<Finding> {
    await this.findOne(id);

    // Update data finding
    await this.prisma.finding.update({
      where: { id },
      data: updateFindingDto,
    });

    // Upsert file per fieldName: hapus entri lama untuk field yang ada file baru,
    // lalu insert yang baru. Field yang tidak diupload ulang tetap tidak disentuh.
    if (uploadedFiles) {
      for (const [fieldName, files] of Object.entries(uploadedFiles)) {
        if (!files || files.length === 0) continue;

        // Hapus entri lama untuk fieldName ini saja
        await this.prisma.findingFile.deleteMany({
          where: { findingId: id, fieldName },
        });

        // Insert entri baru
        for (const file of files) {
          await this.prisma.findingFile.create({
            data: {
              findingId: id,
              fieldName,
              fileName: file.originalname,
              fileUrl: file.fileUrl,
              fileSize: file.size,
              mimeType: file.mimetype,
            },
          });
        }
      }
    }

    return this.prisma.finding.findUnique({
      where: { id },
      include: { createdBy: true, approvedBy: true, files: true },
    }) as Promise<Finding>;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateFindingStatusDto,
    approvedById: string,
    approver: User,
  ): Promise<Finding> {
    const finding = await this.findOne(id);

    const updateData: any = {
      findingStatus: updateStatusDto.findingStatus as any,
      approvedById,
      approvedByName: approver.nama,
      approvedAt: new Date(),
    };

    // Approval status (ACC/TACC) — cast ke any karena enum mungkin belum di-generate
    if (updateStatusDto.approvalStatus) {
      updateData.approvalStatus = updateStatusDto.approvalStatus as any;
      updateData.approvalNote = updateStatusDto.approvalNote ?? null;
    }

    // PIC assignment untuk INPG
    if (updateStatusDto.picId) {
      updateData.picId = updateStatusDto.picId;
      updateData.followUpNote = updateStatusDto.followUpNote;
      if (updateStatusDto.followUpDeadline) {
        updateData.followUpDeadline = new Date(updateStatusDto.followUpDeadline);
      }
    }

    // If closing the finding
    if (updateStatusDto.findingStatus === 'CLSD') {
      updateData.closedAt = new Date();
      updateData.closedById = approvedById;
      updateData.closedByName = approver.nama;
    }

    const updatedFinding = await this.prisma.finding.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: true,
        approvedBy: true,
        files: true,
      },
    });

    // Create notifications
    if (updateStatusDto.findingStatus === 'CLSD' && updateStatusDto.approvalStatus) {
      const isApproved = updateStatusDto.approvalStatus === 'ACC';
      const notifType = isApproved ? 'finding_approved' : 'finding_rejected';
      const notifTitle = isApproved ? 'Finding Disetujui' : 'Finding Ditolak';
      const notifMessage = isApproved
        ? `Finding "${finding.title}" telah disetujui (ACC) oleh ${approver.nama}`
        : `Finding "${finding.title}" ditolak (TACC). Alasan: ${updateStatusDto.approvalNote || 'Tidak ada alasan'}`;

      // Kumpulkan penerima: pembuat + supervisornya
      const recipientIds = new Set<string>([finding.createdById]);

      // Ambil supervisorId dari pembuat
      const creator = await this.prisma.user.findUnique({
        where: { id: finding.createdById },
        select: { supervisorId: true },
      });

      if (creator?.supervisorId) {
        recipientIds.add(creator.supervisorId);
      } else {
        // Fallback: kirim ke semua supervisor & admin jika tidak ada supervisor spesifik
        const supervisors = await this.prisma.user.findMany({
          where: { role: { in: ['supervisor', 'admin'] as any[] }, approved: true },
          select: { id: true },
        });
        for (const sv of supervisors) recipientIds.add(sv.id);
      }

      for (const userId of recipientIds) {
        await this.notificationsService.create({
          userId,
          type: notifType,
          title: notifTitle,
          message: notifMessage,
          findingId: id,
          isRead: false,
        });
      }
    } else if (updateStatusDto.picId) {
      // PIC assignment — notif ke PIC yang ditunjuk
      const deadlineLabel = updateStatusDto.followUpDeadline
        ? new Date(updateStatusDto.followUpDeadline).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
          })
        : 'Tidak ada deadline';

      await this.notificationsService.create({
        userId: updateStatusDto.picId,
        type: 'approval_required',
        title: '📋 Anda Ditunjuk Sebagai PIC',
        message: `Anda ditunjuk sebagai PIC untuk finding "${finding.title}". Harap selesaikan sebelum ${deadlineLabel}.`,
        findingId: id,
        isRead: false,
      });
    }

    return updatedFinding;
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.finding.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Ambil finding INPG yang sudah melewati atau mendekati deadline perbaikan.
   * Dipakai frontend untuk polling notifikasi deadline.
   * @param userId   - filter hanya finding milik user ini (untuk role user)
   *                   jika undefined: return semua (untuk supervisor/admin)
   * @param daysAhead - berapa hari ke depan yang dianggap "mendekati deadline" (default 3)
   */
  async getDeadlineReminders(userId?: string, daysAhead = 3): Promise<any[]> {
    const now = new Date();
    const soonDate = new Date(now);
    soonDate.setDate(soonDate.getDate() + daysAhead);

    const where: any = {
      deletedAt: null,
      findingStatus: 'INPG',
      // data->>'deadlinePerbaikan' ada dan sudah <= soonDate
    };

    if (userId) {
      where.createdById = userId;
    }

    // Ambil semua INPG findings
    const findings = await this.prisma.finding.findMany({
      where,
      include: { createdBy: true, files: true },
      orderBy: { createdAt: 'desc' },
    });

    // Filter yang punya deadlinePerbaikan dan sudah/hampir lewat
    const reminders: any[] = [];
    for (const f of findings) {
      const data = f.data as Record<string, any>;
      const deadlineStr = data?.deadlinePerbaikan;
      if (!deadlineStr) continue;

      const deadline = new Date(deadlineStr);
      if (isNaN(deadline.getTime())) continue;

      const isOverdue = deadline < now;
      const isSoon = !isOverdue && deadline <= soonDate;

      if (isOverdue || isSoon) {
        const diffMs = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        reminders.push({
          id: f.id,
          title: f.title,
          subElementId: f.subElementId,
          createdByName: f.createdByName,
          createdById: f.createdById,
          deadline: deadlineStr,
          isOverdue,
          isSoon,
          daysLeft: diffDays, // negatif jika sudah lewat
        });
      }
    }

    return reminders;
  }
}
