import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InductionService } from './induction.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AddParticipantDto } from './dto/add-participant.dto';

@ApiTags('Safety Induction')
@ApiBearerAuth()
@Controller('api/induction')
@UseGuards(JwtAuthGuard)
export class InductionController {
  constructor(
    private readonly svc: InductionService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // ── POST /api/induction ───────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new Induction session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createSession(@Body() dto: CreateSessionDto) {
    return this.svc.createSession(dto);
  }

  // ── GET /api/induction ────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all Induction sessions' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'ACTIVE', 'COMPLETED'] })
  @ApiResponse({ status: 200, description: 'List of induction sessions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('status') status?: string) {
    return this.svc.findAllSessions(status);
  }

  // ── GET /api/induction/check-duplicate ───────────────────────────────────

  @Get('check-duplicate')
  @ApiOperation({ summary: 'Check duplicate participant by identitas (NIK/KTP/Paspor)' })
  @ApiQuery({ name: 'identitas', required: true, type: 'string', description: 'NIK / KTP / Paspor' })
  @ApiResponse({ status: 200, description: 'Duplicate check result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  checkDuplicate(@Query('identitas') identitas: string) {
    return this.svc.checkDuplicate(identitas);
  }

  // ── GET /api/induction/:id ────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get one Induction session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session detail' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.svc.findSessionById(id);
  }

  // ── PUT /api/induction/:id ────────────────────────────────────────────────

  @Put(':id')
  @ApiOperation({ summary: 'Update Induction session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSessionDto> & { status?: string }) {
    return this.svc.updateSession(id, dto);
  }

  // ── DELETE /api/induction/:id ─────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Induction session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    await this.svc.deleteSession(id);
    return { message: 'Sesi berhasil dihapus' };
  }

  // ── Participants ──────────────────────────────────────────────────────────

  // ── POST /api/induction/:id/participants ──────────────────────────────────

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to Induction session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addParticipant(@Param('id') id: string, @Body() dto: AddParticipantDto) {
    return this.svc.addParticipant(id, dto);
  }

  // ── PATCH /api/induction/participants/:pid/status ─────────────────────────

  @Patch('participants/:pid/status')
  @ApiOperation({ summary: 'Update participant attendance status' })
  @ApiParam({ name: 'pid', description: 'Participant ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        statusHadir: { type: 'string', enum: ['HADIR', 'TIDAK_HADIR'], example: 'HADIR' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateStatus(
    @Param('pid') pid: string,
    @Body('statusHadir') statusHadir: string,
  ) {
    return this.svc.updateParticipantStatus(pid, statusHadir);
  }

  // ── DELETE /api/induction/participants/:pid ───────────────────────────────

  @Delete('participants/:pid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove participant from session' })
  @ApiParam({ name: 'pid', description: 'Participant ID' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeParticipant(@Param('pid') pid: string) {
    await this.svc.removeParticipant(pid);
    return { message: 'Peserta dihapus' };
  }

  // ── GET /api/induction/card/:cardCode ─────────────────────────────────────

  @Get('card/:cardCode')
  @ApiOperation({ summary: 'Get participant by QR card code' })
  @ApiParam({ name: 'cardCode', description: 'QR Card Code' })
  @ApiResponse({ status: 200, description: 'Participant found' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCard(@Param('cardCode') cardCode: string) {
    return this.svc.getParticipantByCardCode(cardCode);
  }

  // ── Media ─────────────────────────────────────────────────────────────────

  // ── POST /api/induction/:id/media ─────────────────────────────────────────

  @Post(':id/media')
  @ApiOperation({ summary: 'Upload media file for Induction session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Media file (image/video)' },
        type: { type: 'string', example: 'FOTO_KEGIATAN', description: 'Tipe media' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Media uploaded successfully' })
  @ApiResponse({ status: 400, description: 'File wajib disertakan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('File wajib disertakan');

    const fileUrl = await this.storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'induction',
    );

    return this.svc.addMedia(
      id,
      type ?? 'FOTO_KEGIATAN',
      fileUrl,
      file.originalname,
      file.size,
      file.mimetype,
      req.user.id,
    );
  }

  // ── DELETE /api/induction/media/:mediaId ──────────────────────────────────

  @Delete('media/:mediaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media from session' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeMedia(@Param('mediaId') mediaId: string) {
    await this.svc.removeMedia(mediaId);
    return { message: 'Media dihapus' };
  }
}


// ── Public routes (no auth) ────────────────────────────────────────────────────

@ApiTags('Safety Induction (Public)')
@Controller('api/induction-public')
export class InductionPublicController {
  constructor(private readonly svc: InductionService) {}

  // GET /api/induction-public/card/:cardCode
  @Get('card/:cardCode')
  @ApiOperation({ summary: 'Get participant info by QR card code (no auth required)' })
  @ApiParam({ name: 'cardCode', description: 'QR Card Code' })
  @ApiResponse({ status: 200, description: 'Participant found' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  getCard(@Param('cardCode') cardCode: string) {
    return this.svc.getParticipantByCardCode(cardCode);
  }
}
