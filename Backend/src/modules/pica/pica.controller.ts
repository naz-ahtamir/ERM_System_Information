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
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PicaService } from './pica.service';
import { CreatePicaDto } from './dto/create-pica.dto';
import { UpdatePicaDto } from './dto/update-pica.dto';
import { ActionPicaDto } from './dto/action-pica.dto';
import { StatusPerbaikanPica } from '@prisma/client';

// ── Upload config ─────────────────────────────────────────────────────────

const MULTER_OPTS = {
  storage: memoryStorage(),
  limits: { fileSize: Infinity },
};

type UploadedPicaFiles = {
  dokumentasiTemuan?: Express.Multer.File[];
  dokumentasiPerbaikan?: Express.Multer.File[];
};

@ApiTags('PICA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/pica')
export class PicaController {
  constructor(private readonly service: PicaService) {}

  // ── GET all ───────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all PICA records (with optional filters)' })
  findAll(
    @Query('divisiId')       divisiId?: string,
    @Query('picId')          picId?: string,
    @Query('status')         status?: string,
    @Query('kategori')       kategori?: string,
    @Query('search')         search?: string,
    @Query('tanggalDari')    tanggalDari?: string,
    @Query('tanggalSampai')  tanggalSampai?: string,
  ) {
    return this.service.findAll({ divisiId, picId, status, kategori, search, tanggalDari, tanggalSampai });
  }

  // ── GET one ───────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get one PICA record by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ── POST: create ──────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Buat temuan PICA baru (admin/supervisor)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'dokumentasiTemuan', maxCount: 10 }],
      MULTER_OPTS,
    ),
  )
  async create(
    @Body() body: any,
    @UploadedFiles() files: UploadedPicaFiles = {},
    @Request() req: any,
  ) {
    // Parse hirarki dari JSON string jika perlu
    let hierarki = body.hierarkiPengendalian;
    if (typeof hierarki === 'string') {
      try { hierarki = JSON.parse(hierarki); } catch { hierarki = [hierarki]; }
    }
    if (!Array.isArray(hierarki)) hierarki = ['Administrasi'];

    // Map display value → Prisma enum key
    const jenisTemuanMap: Record<string, string> = {
      'Kondisi Tidak Aman':  'KONDISI_TIDAK_AMAN',
      'Tindakan Tidak Aman': 'TINDAKAN_TIDAK_AMAN',
      'Hampir Celaka':       'HAMPIR_CELAKA',
      'Ketidaksesuaian':     'KETIDAKSESUAIAN',
    };
    const rawJenis = body.jenisTemuan ?? 'Kondisi Tidak Aman';
    const jenisTemuan = jenisTemuanMap[rawJenis] ?? rawJenis;

    const dto: CreatePicaDto = {
      temuanMasalah: body.temuanMasalah,
      kriteriaId: body.kriteriaId ?? 'TBD',
      kriteriaDeskripsi: body.kriteriaDeskripsi,
      kategori: body.kategori ?? 'MINOR',
      lokasiDivisiId: body.lokasiDivisiId ?? 'TBD',
      lokasiDivisiNama: body.lokasiDivisiNama,
      dokumentasiTemuanTeks: body.dokumentasiTemuanTeks,
      tanggalTemuan: body.tanggalTemuan ?? new Date().toISOString().slice(0, 10),
      jenisTemuan: jenisTemuan as any,
      hierarkiPengendalian: hierarki,
      rekomendasiPerbaikan: body.rekomendasiPerbaikan ?? '-',
      picId: body.picId ?? 'TBD',
      picNama: body.picNama ?? 'TBD',
      divisiId: body.divisiId ?? 'TBD',
      batasAkhir: body.batasAkhir ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      createdBy: body.createdBy ?? req.user?.nama ?? 'Admin',
      createdById: body.createdById ?? req.user?.id,
    };

    const data = await this.service.create(dto, { dokumentasiTemuan: files.dokumentasiTemuan });
    return { message: 'Temuan berhasil dibuat', data };
  }

  // ── PUT: update ───────────────────────────────────────────────────────────

  @Put(':id')
  @ApiOperation({ summary: 'Update PICA record (admin, hanya jika OPEN)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'dokumentasiTemuan', maxCount: 10 }],
      MULTER_OPTS,
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: UploadedPicaFiles = {},
  ) {
    let hierarki = body.hierarkiPengendalian;
    if (typeof hierarki === 'string') {
      try { hierarki = JSON.parse(hierarki); } catch { hierarki = undefined; }
    }

    // Map display value → Prisma enum key
    const jenisTemuanMap: Record<string, string> = {
      'Kondisi Tidak Aman':  'KONDISI_TIDAK_AMAN',
      'Tindakan Tidak Aman': 'TINDAKAN_TIDAK_AMAN',
      'Hampir Celaka':       'HAMPIR_CELAKA',
      'Ketidaksesuaian':     'KETIDAKSESUAIAN',
    };
    const mappedJenis = body.jenisTemuan
      ? (jenisTemuanMap[body.jenisTemuan] ?? body.jenisTemuan)
      : undefined;

    const dto: UpdatePicaDto = {
      ...(body.temuanMasalah && { temuanMasalah: body.temuanMasalah }),
      ...(body.kriteriaId && { kriteriaId: body.kriteriaId }),
      ...(body.kriteriaDeskripsi !== undefined && { kriteriaDeskripsi: body.kriteriaDeskripsi }),
      ...(body.kategori && { kategori: body.kategori }),
      ...(body.lokasiDivisiId && { lokasiDivisiId: body.lokasiDivisiId }),
      ...(body.lokasiDivisiNama !== undefined && { lokasiDivisiNama: body.lokasiDivisiNama }),
      ...(body.dokumentasiTemuanTeks !== undefined && { dokumentasiTemuanTeks: body.dokumentasiTemuanTeks }),
      ...(body.tanggalTemuan && { tanggalTemuan: body.tanggalTemuan }),
      ...(mappedJenis && { jenisTemuan: mappedJenis as any }),
      ...(hierarki && { hierarkiPengendalian: hierarki }),
      ...(body.rekomendasiPerbaikan && { rekomendasiPerbaikan: body.rekomendasiPerbaikan }),
      ...(body.picId && { picId: body.picId }),
      ...(body.picNama && { picNama: body.picNama }),
      ...(body.divisiId && { divisiId: body.divisiId }),
      ...(body.batasAkhir && { batasAkhir: body.batasAkhir }),
    };

    const data = await this.service.update(id, dto, { dokumentasiTemuan: files.dokumentasiTemuan });
    return { message: 'Record berhasil diperbarui', data };
  }

  // ── PATCH: actions (submit_perbaikan | approve | reject | set_in_progress) ─

  @Patch(':id/action')
  @ApiOperation({ summary: 'PICA action: submit_perbaikan | approve | reject | set_in_progress' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'dokumentasiPerbaikan', maxCount: 10 }],
      MULTER_OPTS,
    ),
  )
  async action(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: UploadedPicaFiles = {},
    @Request() req: any,
  ) {
    const actionName = body.action as string;
    if (!actionName) throw new BadRequestException('action diperlukan');

    const data = await this.service.action({
      id,
      action: actionName,
      keterangan: body.keterangan,
      oleh: body.oleh ?? req.user?.nama,
      files: { dokumentasiPerbaikan: files.dokumentasiPerbaikan },
    });
    return { message: 'Berhasil', data };
  }

  // ── PATCH: update status langsung ─────────────────────────────────────────

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status PICA langsung (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; keterangan?: string },
  ) {
    if (!body.status) throw new BadRequestException('status diperlukan');
    const data = await this.service.updateStatus(id, body.status, body.keterangan);
    return { message: 'Status berhasil diperbarui', data };
  }

  // ── DELETE FILE ───────────────────────────────────────────────────────────

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus satu file attachment dari record PICA' })
  deleteFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    return this.service.deleteFile(id, fileId);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus record PICA (admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
