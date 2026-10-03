import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * GET /api/notifications?limit=10
   * Ambil notifikasi milik user yang sedang login.
   */
  @Get()
  @ApiOperation({ summary: 'Ambil notifikasi milik user yang login' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maksimal jumlah notifikasi yang diambil' })
  @ApiResponse({ status: 200, description: 'Daftar notifikasi berhasil diambil' })
  async findByUserId(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findByUserId(
      req.user.id,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  /**
   * GET /api/notifications/unread-count
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Hitung notifikasi belum dibaca milik user yang login' })
  @ApiResponse({ status: 200, description: 'Jumlah notifikasi belum dibaca', schema: { example: { count: 3 } } })
  async getUnreadCount(
    @Request() req: any,
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  /**
   * POST /api/notifications
   * Hanya admin.
   */
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Buat notifikasi baru (admin only)' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notifikasi berhasil dibuat' })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(createNotificationDto);
  }

  /**
   * PATCH /api/notifications/read-all
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'Tandai semua notifikasi user sebagai sudah dibaca' })
  @ApiResponse({ status: 200, description: 'Semua notifikasi ditandai dibaca', schema: { example: { message: 'OK', count: 5 } } })
  async markAllAsRead(
    @Request() req: any,
  ): Promise<{ message: string; count: number }> {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Tandai satu notifikasi sebagai sudah dibaca' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notifikasi ditandai dibaca' })
  async markAsRead(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
