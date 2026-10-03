import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { LicenseSchedulerService } from './license-scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Endpoint admin-only untuk trigger pengecekan masa berlaku license secara manual.
 *
 * POST /api/scheduler/check-licenses
 * POST /api/scheduler/check-licenses?force=true  → skip dedup harian (untuk dev/testing)
 */
@ApiTags('Scheduler (Admin)')
@ApiBearerAuth()
@Controller('api/scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicenseSchedulerController {
  constructor(private readonly schedulerService: LicenseSchedulerService) {}

  @Post('check-licenses')
  @Roles('admin')
  @ApiOperation({ summary: 'Trigger pengecekan masa berlaku license secara manual (admin only)' })
  @ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Jika true, skip dedup harian — berguna untuk testing' })
  @ApiResponse({
    status: 201,
    description: 'Pengecekan selesai',
    schema: { example: { message: 'Pengecekan masa berlaku license selesai.', created: 2, skipped: 0 } },
  })
  @ApiResponse({ status: 403, description: 'Hanya admin yang bisa mengakses endpoint ini' })
  async triggerLicenseCheck(
    @Query('force') force?: string,
  ): Promise<{ message: string; created: number; skipped: number }> {
    const result = await this.schedulerService.runNow(force === 'true');
    return {
      message: 'Pengecekan masa berlaku license selesai.',
      created: result.created,
      skipped: result.skipped,
    };
  }
}
