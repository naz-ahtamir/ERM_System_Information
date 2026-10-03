import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { DeadlineSchedulerService } from './deadline-scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Endpoint admin-only untuk trigger pengecekan deadline secara manual.
 * Berguna untuk testing atau menjalankan ulang di luar jadwal cron.
 *
 * POST /api/scheduler/check-deadlines
 * POST /api/scheduler/check-deadlines?force=true  → skip dedup harian
 */
@ApiTags('Scheduler (Admin)')
@ApiBearerAuth()
@Controller('api/scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeadlineSchedulerController {
  constructor(private readonly schedulerService: DeadlineSchedulerService) {}

  @Post('check-deadlines')
  @Roles('admin')
  @ApiOperation({ summary: 'Trigger pengecekan deadline secara manual (admin only)' })
  @ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Jika true, skip dedup harian — berguna untuk testing' })
  @ApiResponse({
    status: 201,
    description: 'Pengecekan selesai',
    schema: { example: { message: 'Pengecekan deadline selesai.', created: 3, skipped: 1 } },
  })
  @ApiResponse({ status: 403, description: 'Hanya admin yang bisa mengakses endpoint ini' })
  async triggerDeadlineCheck(
    @Query('force') force?: string,
  ): Promise<{ message: string; created: number; skipped: number }> {
    const result = await this.schedulerService.runNow(force === 'true');
    return {
      message: `Pengecekan deadline selesai.`,
      created: result.created,
      skipped: result.skipped,
    };
  }
}
