import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmergencyDrillDto } from './dto/create-emergency-drill.dto';
import { UpdateEmergencyDrillDto } from './dto/update-emergency-drill.dto';
import { DrillStatus, Prisma } from '@prisma/client';

// ── Prisma include shape ──────────────────────────────────────────────────────

const INCLUDE = {
  department: { select: { id: true, name: true, code: true } },
  createdBy: { select: { id: true, nama: true } },
  updatedBy: { select: { id: true, nama: true } },
} satisfies Prisma.EmergencyDrillInclude;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDate(v?: string | null): Date | undefined {
  return v ? new Date(v) : undefined;
}

/**
 * Auto-calculate participationRate.
 * Returns null if totalStaff is falsy/0.
 */
function calcParticipationRate(
  totalTKA?: number | null,
  totalTKI?: number | null,
  totalStaff?: number | null,
): number | null {
  if (!totalStaff || totalStaff === 0) return 0;
  return ((Number(totalTKA ?? 0) + Number(totalTKI ?? 0)) / totalStaff) * 100;
}

/**
 * Determine status from actualDate:
 * - actualDate filled → COMPLETED
 * - actualDate empty  → NOT_COMPLETED
 */
function resolveStatus(actualDate?: string | Date | null): DrillStatus {
  return actualDate ? DrillStatus.COMPLETED : DrillStatus.NOT_COMPLETED;
}

@Injectable()
export class EmergencyDrillService {
  constructor(private prisma: PrismaService) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateEmergencyDrillDto) {
    const participationRate = calcParticipationRate(dto.totalTKA, dto.totalTKI, dto.totalStaff);
    const status = resolveStatus(dto.actualDate);

    return this.prisma.emergencyDrill.create({
      data: {
        // Plan
        planDate:     new Date(dto.planDate),
        drillType:    dto.drillType,
        scenario:     dto.scenario,
        departmentId: dto.departmentId,
        division:     dto.division,
        picPlan:      dto.picPlan,
        notesPlan:    dto.notesPlan ?? null,
        // Actual
        actualDate:        toDate(dto.actualDate) ?? null,
        location:          dto.location ?? null,
        totalTKA:          dto.totalTKA != null ? Number(dto.totalTKA) : null,
        totalTKI:          dto.totalTKI != null ? Number(dto.totalTKI) : null,
        totalStaff:        dto.totalStaff != null ? Number(dto.totalStaff) : null,
        participationRate: participationRate,
        duration:          dto.duration ?? null,
        picActual:         dto.picActual ?? null,
        notesActual:       dto.notesActual ?? null,
        // Files
        photoDocumentation: dto.photoDocumentation ?? null,
        attendanceList:     dto.attendanceList ?? null,
        drillReport:        dto.drillReport ?? null,
        // Auto
        status,
        createdById: userId,
      },
      include: INCLUDE,
    });
  }

  // ── Find All ──────────────────────────────────────────────────────────────

  async findAll(filters: {
    status?: string;
    drillType?: string;
    departmentId?: string;
    search?: string;
  }) {
    const where: Prisma.EmergencyDrillWhereInput = {};

    if (filters.status)       where.status = filters.status as DrillStatus;
    if (filters.drillType)    where.drillType = filters.drillType as any;
    if (filters.departmentId) where.departmentId = filters.departmentId;

    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { scenario:  { contains: q, mode: 'insensitive' } },
        { picPlan:   { contains: q, mode: 'insensitive' } },
        { picActual: { contains: q, mode: 'insensitive' } },
        { location:  { contains: q, mode: 'insensitive' } },
        { division:  { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.emergencyDrill.findMany({
      where,
      orderBy: { planDate: 'desc' },
      include: INCLUDE,
    });
  }

  // ── Find One ──────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const record = await this.prisma.emergencyDrill.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!record) throw new NotFoundException(`Emergency Drill ${id} tidak ditemukan`);
    return record;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateEmergencyDrillDto) {
    await this.findOne(id);

    // Fetch current record to merge nullable values properly
    const current = await this.prisma.emergencyDrill.findUnique({
      where: { id },
      select: { actualDate: true, totalTKA: true, totalTKI: true, totalStaff: true },
    });

    // Resolve final values (dto wins; fall back to current)
    const actualDate = dto.actualDate !== undefined
      ? toDate(dto.actualDate) ?? null
      : current?.actualDate ?? null;

    const totalTKA   = dto.totalTKA   != null ? Number(dto.totalTKA)   : (current?.totalTKA   ?? null);
    const totalTKI   = dto.totalTKI   != null ? Number(dto.totalTKI)   : (current?.totalTKI   ?? null);
    const totalStaff = dto.totalStaff != null ? Number(dto.totalStaff) : (current?.totalStaff ?? null);

    const participationRate = calcParticipationRate(totalTKA, totalTKI, totalStaff);
    const status = resolveStatus(actualDate);

    const data: Prisma.EmergencyDrillUpdateInput = {
      ...(dto.planDate     !== undefined && { planDate:  new Date(dto.planDate) }),
      ...(dto.drillType    !== undefined && { drillType: dto.drillType }),
      ...(dto.scenario     !== undefined && { scenario:  dto.scenario }),
      ...(dto.departmentId !== undefined && { department: { connect: { id: dto.departmentId } } }),
      ...(dto.division     !== undefined && { division:  dto.division }),
      ...(dto.picPlan      !== undefined && { picPlan:   dto.picPlan }),
      ...(dto.notesPlan    !== undefined && { notesPlan: dto.notesPlan ?? null }),
      // Actual
      actualDate,
      totalTKA,
      totalTKI,
      totalStaff,
      participationRate,
      ...(dto.duration    !== undefined && { duration:    dto.duration ?? null }),
      ...(dto.picActual   !== undefined && { picActual:   dto.picActual ?? null }),
      ...(dto.notesActual !== undefined && { notesActual: dto.notesActual ?? null }),
      // Files
      ...(dto.photoDocumentation !== undefined && { photoDocumentation: dto.photoDocumentation ?? null }),
      ...(dto.attendanceList     !== undefined && { attendanceList:     dto.attendanceList ?? null }),
      ...(dto.drillReport        !== undefined && { drillReport:        dto.drillReport ?? null }),
      // Auto
      status,
      updatedBy: { connect: { id: userId } },
    };

    return this.prisma.emergencyDrill.update({
      where: { id },
      data,
      include: INCLUDE,
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async remove(id: string, userId: string) {
    await this.findOne(id);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa menghapus Emergency Drill');
    }
    return this.prisma.emergencyDrill.delete({ where: { id } });
  }
}
