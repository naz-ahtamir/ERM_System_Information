import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ObjekK3SchedulerService } from './objek-k3-scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Endpoint admin-only untuk trigger pengecekan riksa uji ObjekK3 secara manual.
 *
 * POST /api/scheduler/check-riksa-uji
 * POST /api/scheduler/check-riksa-uji?force=true  → skip dedup harian (untuk testing)
 */
@ApiTags('Scheduler (Admin)')
@ApiBearerAuth()
@Controller('api/scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ObjekK3SchedulerController {
  constructor(private readonly schedulerService: ObjekK3SchedulerService) {}

  @Post('check-riksa-uji')
  @Roles('admin')
  @ApiOperation({ summary: 'Trigger pengecekan riksa uji ObjekK3 secara manual (admin only)' })
  @ApiQuery({
    name: 'force',
    required: false,
    type: Boolean,
    description: 'Jika true, skip dedup harian — berguna untuk testing',
  })
  @ApiResponse({
    status: 201,
    description: 'Pengecekan selesai',
    schema: { example: { message: 'Pengecekan riksa uji selesai.', created: 5, skipped: 0 } },
  })
  @ApiResponse({ status: 403, description: 'Hanya admin yang bisa mengakses endpoint ini' })
  async triggerRiksaUjiCheck(
    @Query('force') force?: string,
  ): Promise<{ message: string; created: number; skipped: number }> {
    const result = await this.schedulerService.runNow(force === 'true');
    return {
      message: 'Pengecekan riksa uji ObjekK3 selesai.',
      created: result.created,
      skipped: result.skipped,
    };
  }
}
