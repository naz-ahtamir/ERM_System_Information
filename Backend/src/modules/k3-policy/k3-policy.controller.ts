// src/modules/k3-policy/k3-policy.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { K3PolicyService } from './k3-policy.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

const K3_POLICY_MULTIPART = {
  schema: {
    type: 'object',
    properties: {
      jenisKebijakan:   { type: 'string', enum: ['UMUM', 'KHUSUS'], example: 'UMUM' },
      judulKebijakan:   { type: 'string', example: 'Kebijakan K3 PT QMB' },
      tanggalPenetapan: { type: 'string', format: 'date', example: '2026-01-01' },
      penandatangan:    { type: 'string', example: 'Zhou Yang' },
      jabatan:          { type: 'string', example: 'Deputy Manager' },
      statusDokumen:    { type: 'string', enum: ['ASLI', 'SALINAN', 'ASLI-REVISI', 'SALINAN-REVISI'], example: 'ASLI' },
      statusDistribusi: { type: 'string', enum: ['TERKENDALI', 'TIDAK TERKENDALI'], example: 'TERKENDALI' },
      statusValidasi:   { type: 'string', enum: ['BERLAKU', 'EDISI LAMA', 'BATALKAN'], example: 'BERLAKU' },
      file:             { type: 'string', format: 'binary', description: 'File PDF kebijakan (maks 10 MB)' },
    },
  },
};

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
function fileFilter(_req: any, file: Express.Multer.File, cb: any) {
  cb(null, ALLOWED_EXT.includes(extname(file.originalname).toLowerCase()));
}

@ApiTags('K3 Policy')
@ApiBearerAuth()
@Controller('api/k3-policy')
@UseGuards(JwtAuthGuard)
export class K3PolicyController {
  constructor(
    private readonly service: K3PolicyService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // 鈹€鈹€ GET all 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get()
  @ApiOperation({ summary: 'Get all K3 Policy records' })
  @ApiResponse({ status: 200, description: 'List of K3 Policies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.service.findAll();
  }

  // 鈹€鈹€ GET one 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get(':id')
  @ApiOperation({ summary: 'Get one K3 Policy by ID' })
  @ApiParam({ name: 'id', description: 'K3 Policy ID' })
  @ApiResponse({ status: 200, description: 'K3 Policy detail' })
  @ApiResponse({ status: 404, description: 'K3 Policy not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 鈹€鈹€ POST create with file 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Post('with-file')
  @ApiOperation({ summary: 'Create K3 Policy with optional file upload (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(K3_POLICY_MULTIPART)
  @ApiResponse({ status: 201, description: 'K3 Policy created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter,
    limits: { fileSize: Infinity },
  }))
  async createWithFile(
    @Request() req,
    @Body('jenisKebijakan') jenisKebijakan: string,
    @Body('judulKebijakan') judulKebijakan: string,
    @Body('tanggalPenetapan') tanggalPenetapan: string,
    @Body('penandatangan') penandatangan: string,
    @Body('jabatan') jabatan: string,
    @Body('statusDokumen') statusDokumen: string,
    @Body('statusDistribusi') statusDistribusi: string,
    @Body('statusValidasi') statusValidasi: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = await this.storageService.uploadOptional(file, 'k3-policy');
    return this.service.create(req.user.id, {
      jenisKebijakan: jenisKebijakan as any,
      judulKebijakan,
      tanggalPenetapan,
      penandatangan,
      jabatan,
      statusDokumen: statusDokumen as any,
      statusDistribusi: statusDistribusi as any,
      statusValidasi: statusValidasi as any,
      fileUrl,
    } as any);
  }

  // 鈹€鈹€ PUT update with file 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Put('with-file/:id')
  @ApiOperation({ summary: 'Update K3 Policy with optional file upload (multipart/form-data)' })
  @ApiParam({ name: 'id', description: 'K3 Policy ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(K3_POLICY_MULTIPART)
  @ApiResponse({ status: 200, description: 'K3 Policy updated successfully' })
  @ApiResponse({ status: 404, description: 'K3 Policy not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter,
    limits: { fileSize: Infinity },
  }))
  async updateWithFile(
    @Param('id') id: string,
    @Request() req,
    @Body('jenisKebijakan') jenisKebijakan: string,
    @Body('judulKebijakan') judulKebijakan: string,
    @Body('tanggalPenetapan') tanggalPenetapan: string,
    @Body('penandatangan') penandatangan: string,
    @Body('jabatan') jabatan: string,
    @Body('statusDokumen') statusDokumen: string,
    @Body('statusDistribusi') statusDistribusi: string,
    @Body('statusValidasi') statusValidasi: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = await this.storageService.uploadOptional(file, 'k3-policy');
    return this.service.update(id, req.user.id, {
      jenisKebijakan: jenisKebijakan as any,
      judulKebijakan,
      tanggalPenetapan,
      penandatangan,
      jabatan,
      statusDokumen: statusDokumen as any,
      statusDistribusi: statusDistribusi as any,
      statusValidasi: statusValidasi as any,
      ...(fileUrl !== undefined && { fileUrl }),
    } as any);
  }

  // 鈹€鈹€ DELETE 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete K3 Policy by ID' })
  @ApiParam({ name: 'id', description: 'K3 Policy ID' })
  @ApiResponse({ status: 200, description: 'K3 Policy deleted successfully' })
  @ApiResponse({ status: 404, description: 'K3 Policy not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.service.delete(id, req.user.id);
  }
}

