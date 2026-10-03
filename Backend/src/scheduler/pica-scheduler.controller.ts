import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PicaSchedulerService } from './pica-scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Endpoint admin-only untuk trigger pengecekan notifikasi PICA secara manual.
 *
 * POST /api/scheduler/check-pica
 * POST /api/scheduler/check-pica?force=true  → skip dedup harian (untuk testing)
 */
@ApiTags('Scheduler (Admin)')
@ApiBearerAuth()
@Controller('api/scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PicaSchedulerController {
  constructor(private readonly schedulerService: PicaSchedulerService) {}

  @Post('check-pica')
  @Roles('admin')
  @ApiOperation({ summary: 'Trigger pengecekan notifikasi PICA secara manual (admin only)' })
  @ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Jika true, skip dedup harian' })
  @ApiResponse({
    status: 201,
    description: 'Pengecekan selesai',
    schema: { example: { message: 'Pengecekan PICA selesai.', overdue: 2, tacc: 1, skipped: 0 } },
  })
  async triggerPicaCheck(
    @Query('force') force?: string,
  ): Promise<{ message: string; overdue: number; tacc: number; skipped: number }> {
    const result = await this.schedulerService.runNow(force === 'true');
    return {
      message: 'Pengecekan PICA selesai.',
      overdue: result.overdue,
      tacc: result.tacc,
      skipped: result.skipped,
    };
  }
}
