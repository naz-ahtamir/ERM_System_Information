import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InvestigationService } from './investigation.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { SignApprovalDto, SignVictimDto, SignSupervisorDto } from './dto/sign-investigation.dto';

// 鈹€鈹€ Upload config 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function fileFilter(_req: any, file: Express.Multer.File, cb: any) {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];
  cb(null, allowed.includes(extname(file.originalname).toLowerCase()));
}

const LIMITS = { fileSize: Infinity }; // no limit

type UploadedInvFiles = {
  fotoBukti?: Express.Multer.File[];
  lampiranLaporan?: Express.Multer.File[];
  signatureApproval?: Express.Multer.File[];
  victimSignature?: Express.Multer.File[];
  supervisorSignature?: Express.Multer.File[];
};

const FILE_FIELDS = [
  { name: 'fotoBukti',          maxCount: 1 },
  { name: 'lampiranLaporan',    maxCount: 1 },
  { name: 'signatureApproval',  maxCount: 1 },
  { name: 'victimSignature',    maxCount: 1 },
  { name: 'supervisorSignature', maxCount: 1 },
];

// 鈹€鈹€ Decorator shorthand 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function WithFiles() {
  return UseInterceptors(
    FileFieldsInterceptor(FILE_FIELDS, {
      storage: memoryStorage(),
      fileFilter,
      limits: LIMITS,
    }),
  );
}

@ApiTags('Investigation (Investigasi Kecelakaan)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/investigation')
export class InvestigationController {
  constructor(
    private readonly service: InvestigationService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // 鈹€鈹€ GET all 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get()
  @ApiOperation({ summary: 'Daftar semua investigasi (dengan filter opsional)' })
  findAll(
    @Query('status')           status?: string,
    @Query('jenisKecelakaan')  jenisKecelakaan?: string,
    @Query('pelaporId')        pelaporId?: string,
    @Query('search')           search?: string,
  ) {
    return this.service.findAll({ status, jenisKecelakaan, pelaporId, search });
  }

  // 鈹€鈹€ GET one 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu investigasi' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 鈹€鈹€ POST create 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Post()
  @ApiOperation({ summary: 'Buat laporan kecelakaan baru (DRAFT)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tanggalKejadian', 'waktuKejadian', 'lokasi', 'area', 'deskripsiKejadian', 'jenisKecelakaan'],
      properties: {
        tanggalKejadian:   { type: 'string', format: 'date',   example: '2026-09-15' },
        waktuKejadian:     { type: 'string',                   example: '08:30' },
        lokasi:            { type: 'string',                   example: 'Gedung A lantai 2' },
        area:              { type: 'string',                   example: 'Area Produksi' },
        deskripsiKejadian: { type: 'string',                   example: 'Karyawan terjatuh saat...' },
        jenisKecelakaan:   { type: 'string', enum: ['LUKA_RINGAN','LUKA_BERAT','MENINGGAL','KERUSAKAN','NEAR_MISS'] },
        jumlahKorban:      { type: 'integer', example: 1 },
        saksi:             { type: 'string',                   example: 'Agus, Rina' },
        kerugianMaterial:  { type: 'string',                   example: 'Mesin press ~Rp 5jt' },
        fotoBukti:         { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Laporan berhasil dibuat dengan status DRAFT' })
  @WithFiles()
  async create(
    @Request() req,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: UploadedInvFiles,
  ) {
    const dto = await this.parseCreateBody(body, files);
    return this.service.create(req.user.id, dto);
  }

  // 鈹€鈹€ PUT update 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Put(':id')
  @ApiOperation({ summary: 'Update data kecelakaan / investigasi' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tanggalKejadian:      { type: 'string', format: 'date' },
        waktuKejadian:        { type: 'string' },
        lokasi:               { type: 'string' },
        area:                 { type: 'string' },
        deskripsiKejadian:    { type: 'string' },
        jenisKecelakaan:      { type: 'string', enum: ['LUKA_RINGAN','LUKA_BERAT','MENINGGAL','KERUSAKAN','NEAR_MISS'] },
        jumlahKorban:         { type: 'integer' },
        saksi:                { type: 'string' },
        kerugianMaterial:     { type: 'string' },
        fotoBukti:            { type: 'string', format: 'binary' },
        investigatorId:       { type: 'string', description: 'ID user investigator' },
        tanggalInvestigasi:   { type: 'string', format: 'date' },
        rootCause:            { type: 'string' },
        temuanInvestigasi:    { type: 'string' },
        rekomendasiPerbaikan: { type: 'string' },
        lampiranLaporan:      { type: 'string', format: 'binary' },
        catatanTambahan:      { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Data berhasil diperbarui' })
  @WithFiles()
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: UploadedInvFiles,
  ) {
    const dto = await this.parseUpdateBody(body, files);
    return this.service.update(id, req.user.id, dto);
  }

  // 鈹€鈹€ PATCH start-investigation 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Patch(':id/start-investigation')
  @ApiOperation({ summary: 'Mulai investigasi (DRAFT 鈫?UNDER_INVESTIGATION)' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiBody({ schema: { type: 'object', properties: { investigatorId: { type: 'string', description: 'ID user yang ditugaskan sebagai investigator (opsional)' } } } })
  @ApiResponse({ status: 200, description: 'Status berubah ke UNDER_INVESTIGATION' })
  startInvestigation(
    @Param('id') id: string,
    @Request() req,
    @Body('investigatorId') investigatorId?: string,
  ) {
    return this.service.startInvestigation(id, req.user.id, investigatorId);
  }

  // 鈹€鈹€ PATCH submit-approval 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Patch(':id/submit-approval')
  @ApiOperation({ summary: 'Kirim laporan untuk approval (UNDER_INVESTIGATION 鈫?PENDING_APPROVAL)' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiResponse({ status: 200, description: 'Status berubah ke PENDING_APPROVAL' })
  @ApiResponse({ status: 400, description: 'Root cause / temuan / rekomendasi belum diisi' })
  submitForApproval(@Param('id') id: string, @Request() req) {
    return this.service.submitForApproval(id, req.user.id);
  }

  // 鈹€鈹€ PATCH approve 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve laporan (PENDING_APPROVAL 鈫?APPROVED)' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiBody({ schema: { type: 'object', properties: { signatureApproval: { type: 'string', description: 'URL / base64 tanda tangan (opsional)' } } } })
  @ApiResponse({ status: 200, description: 'Status berubah ke APPROVED' })
  approve(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { signatureApproval?: string },
  ) {
    const dto: SignApprovalDto = {
      signatureApproval: body.signatureApproval,
    };
    return this.service.approve(id, req.user.id, dto);
  }

  // 鈹€鈹€ PATCH reject 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Tolak laporan (PENDING_APPROVAL 鈫?REJECTED)' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string', example: 'Temuan tidak cukup detail', description: 'Alasan penolakan' } } } })
  @ApiResponse({ status: 200, description: 'Status berubah ke REJECTED' })
  reject(
    @Param('id') id: string,
    @Request() req,
    @Body('reason') reason: string,
  ) {
    return this.service.reject(id, req.user.id, reason ?? 'Tidak memenuhi syarat');
  }

  // 鈹€鈹€ PATCH sign-victim 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Patch(':id/sign-victim')
  @ApiOperation({ summary: 'Tanda tangan korban (APPROVED 鈫?VICTIM_SIGNED)' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiBody({ schema: { type: 'object', properties: { victimSignature: { type: 'string', description: 'URL / base64 tanda tangan korban (opsional)' } } } })
  @ApiResponse({ status: 200, description: 'Status berubah ke VICTIM_SIGNED' })
  signByVictim(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { victimSignature?: string },
  ) {
    const dto: SignVictimDto = {
      victimSignature: body.victimSignature,
    };
    return this.service.signByVictim(id, req.user.id, dto);
  }

  // 鈹€鈹€ PATCH sign-supervisor 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Patch(':id/sign-supervisor')
  @ApiOperation({ summary: 'Tanda tangan atasan korban (VICTIM_SIGNED 鈫?COMPLETED)' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        supervisorSignature: { type: 'string', description: 'URL / base64 tanda tangan atasan (opsional)' },
        supervisorNote:      { type: 'string', description: 'Catatan atasan korban (opsional)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status berubah ke COMPLETED, Finding otomatis dibuat jika ada rekomendasi' })
  signBySupervisor(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { supervisorSignature?: string; supervisorNote?: string },
  ) {
    const dto: SignSupervisorDto = {
      supervisorSignature: body.supervisorSignature,
      supervisorNote:      body.supervisorNote,
    };
    return this.service.signBySupervisor(id, req.user.id, dto);
  }

  // 鈹€鈹€ DELETE 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus investigasi (admin only, hanya status DRAFT)' })
  @ApiParam({ name: 'id', description: 'Investigation ID' })
  @ApiResponse({ status: 200, description: 'Investigasi berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Hanya admin yang bisa menghapus' })
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.id);
  }

  // 鈹€鈹€ Helpers 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  private async uploadField(files: UploadedInvFiles, key: keyof UploadedInvFiles): Promise<string | undefined> {
    const file = files?.[key]?.[0];
    if (!file) return undefined;
    return this.storageService.upload(file.buffer, file.originalname, file.mimetype, 'investigation');
  }

  private async parseCreateBody(
    body: Record<string, string>,
    files: UploadedInvFiles,
  ): Promise<CreateInvestigationDto> {
    const n = (v?: string) => (v !== undefined && v !== '' ? Number(v) : undefined);
    return {
      tanggalKejadian:   body.tanggalKejadian,
      waktuKejadian:     body.waktuKejadian,
      lokasi:            body.lokasi,
      area:              body.area,
      deskripsiKejadian: body.deskripsiKejadian,
      jenisKecelakaan:   body.jenisKecelakaan as any,
      jumlahKorban:      n(body.jumlahKorban),
      daftarKorban:      body.daftarKorban || undefined,
      saksi:             body.saksi || undefined,
      kerugianMaterial:  body.kerugianMaterial || undefined,
      fotoBukti:         (await this.uploadField(files, 'fotoBukti')) ?? body.fotoBukti,
    };
  }

  private async parseUpdateBody(
    body: Record<string, string>,
    files: UploadedInvFiles,
  ): Promise<UpdateInvestigationDto> {
    const n = (v?: string) => (v !== undefined && v !== '' ? Number(v) : undefined);
    return {
      tanggalKejadian:     body.tanggalKejadian     || undefined,
      waktuKejadian:       body.waktuKejadian        || undefined,
      lokasi:              body.lokasi               || undefined,
      area:                body.area                 || undefined,
      deskripsiKejadian:   body.deskripsiKejadian    || undefined,
      jenisKecelakaan:     body.jenisKecelakaan as any || undefined,
      jumlahKorban:        n(body.jumlahKorban),
      daftarKorban:        body.daftarKorban         || undefined,
      saksi:               body.saksi                || undefined,
      kerugianMaterial:    body.kerugianMaterial      || undefined,
      fotoBukti:           (await this.uploadField(files, 'fotoBukti')) ?? body.fotoBukti ?? undefined,
      investigatorId:      body.investigatorId       || undefined,
      tanggalInvestigasi:  body.tanggalInvestigasi   || undefined,
      rootCause:           body.rootCause            || undefined,
      temuanInvestigasi:   body.temuanInvestigasi    || undefined,
      rekomendasiPerbaikan: body.rekomendasiPerbaikan || undefined,
      lampiranLaporan:     (await this.uploadField(files, 'lampiranLaporan')) ?? body.lampiranLaporan ?? undefined,
      catatanTambahan:     body.catatanTambahan      || undefined,
    };
  }
}

