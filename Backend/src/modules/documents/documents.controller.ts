import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DocumentsService } from './documents.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';

// 鈹€鈹€ Swagger multipart body schema 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const MULTIPART_SCHEMA = {
  schema: {
    type: 'object',
    required: [
      'departemenId', 'jenisDokumen', 'namaDokumen', 'nomorDokumen',
      'tanggalTerbit', 'statusDokumen', 'statusDistribusi', 'statusValidasi',
    ],
    properties: {
      departemenId:     { type: 'string', example: 'uuid-departemen' },
      jenisDokumen:     { type: 'string', enum: ['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'] },
      namaDokumen:      { type: 'string', example: 'SOP Penanganan Limbah B3' },
      nomorDokumen:     { type: 'string', example: 'SOP-HSE-001' },
      revisi:           { type: 'string', example: '00' },
      tanggalTerbit:    { type: 'string', format: 'date', example: '2025-01-15' },
      statusDokumen:    { type: 'string', enum: ['ASLI', 'SALINAN', 'ASLI_REVISI', 'SALINAN_REVISI'] },
      statusDistribusi: { type: 'string', enum: ['TERKENDALI', 'TIDAK_TERKENDALI'] },
      statusValidasi:   { type: 'string', enum: ['BERLAKU', 'TIDAK_BERLAKU', 'PEMUSNAHAN'] },
      parentId:         { type: 'string', description: 'Opsional 鈥?UUID dokumen parent' },
      file: {
        type: 'string',
        format: 'binary',
        description: 'File dokumen (PDF/Word, maks. 10 MB) 鈥?opsional',
      },
    },
  },
};

const ALLOWED_DOC_EXT = ['.pdf', '.doc', '.docx'];
function docFileFilter(_req: any, file: Express.Multer.File, cb: any) {
  cb(null, ALLOWED_DOC_EXT.includes(extname(file.originalname).toLowerCase()));
}

@ApiTags('Master List Documents')
@ApiBearerAuth()
@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly svc: DocumentsService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // 鈹€鈹€ GET /api/documents 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get()
  @ApiOperation({
    summary: 'List semua dokumen (flat)',
    description: 'Kembalikan flat array, dapat difilter by departemenId dan/atau jenisDokumen.',
  })
  @ApiQuery({ name: 'departemenId', required: false, description: 'UUID departemen' })
  @ApiQuery({ name: 'jenisDokumen', required: false, enum: ['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'] })
  @ApiResponse({ status: 200, description: 'Berhasil' })
  findAll(
    @Query('departemenId') departemenId?: string,
    @Query('jenisDokumen') jenisDokumen?: string,
  ) {
    return this.svc.findAll({ departemenId, jenisDokumen });
  }

  // 鈹€鈹€ GET /api/documents/tree 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get('tree')
  @ApiOperation({
    summary: 'List dokumen sebagai nested tree',
    description: 'Sama seperti list flat tetapi sudah tersusun hierarki parent鈫抍hildren.',
  })
  @ApiQuery({ name: 'departemenId', required: false, description: 'Filter per departemen' })
  @ApiResponse({ status: 200, description: 'Berhasil' })
  findTree(@Query('departemenId') departemenId?: string) {
    return this.svc.findTree(departemenId);
  }

  // 鈹€鈹€ GET /api/documents/stats 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get('stats')
  @ApiOperation({ summary: 'Statistik dokumen 鈥?total, per jenis, per status, per departemen' })
  @ApiResponse({ status: 200, description: 'Berhasil' })
  getStats() {
    return this.svc.getStats();
  }

  // 鈹€鈹€ GET /api/documents/:id 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu dokumen beserta children langsung' })
  @ApiParam({ name: 'id', description: 'UUID dokumen' })
  @ApiResponse({ status: 200, description: 'Berhasil' })
  @ApiResponse({ status: 404, description: 'Tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // 鈹€鈹€ POST /api/documents (JSON) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah dokumen baru (JSON, tanpa file)' })
  @ApiResponse({ status: 201, description: 'Berhasil dibuat' })
  @ApiResponse({ status: 403, description: 'Forbidden 鈥?hanya admin' })
  create(@Body() dto: CreateDocumentDto, @Request() req: any) {
    return this.svc.create(dto, req.user.id);
  }

  // 鈹€鈹€ POST /api/documents/with-file (multipart) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Post('with-file')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah dokumen + upload file PDF/Word (opsional)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(MULTIPART_SCHEMA)
  @ApiResponse({ status: 201, description: 'Berhasil dibuat' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: docFileFilter,
      limits: { fileSize: Infinity },
    }),
  )
  async createWithFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('departemenId')     departemenId: string,
    @Body('jenisDokumen')     jenisDokumen: string,
    @Body('namaDokumen')      namaDokumen: string,
    @Body('nomorDokumen')     nomorDokumen: string,
    @Body('revisi')           revisi: string,
    @Body('tanggalTerbit')    tanggalTerbit: string,
    @Body('statusDokumen')    statusDokumen: string,
    @Body('statusDistribusi') statusDistribusi: string,
    @Body('statusValidasi')   statusValidasi: string,
    @Body('parentId')         parentId: string,
    @Request() req: any,
  ) {
    const fileUrl = await this.storageService.uploadOptional(file, 'documents');
    return this.svc.create(
      {
        departemenId,
        jenisDokumen:     jenisDokumen as any,
        namaDokumen,
        nomorDokumen,
        revisi,
        tanggalTerbit,
        statusDokumen:    statusDokumen as any,
        statusDistribusi: statusDistribusi as any,
        statusValidasi:   statusValidasi as any,
        parentId:         parentId || undefined,
      },
      req.user.id,
      fileUrl,
    );
  }

  // 鈹€鈹€ PUT /api/documents/:id (JSON) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update dokumen (JSON, tanpa file)' })
  @ApiParam({ name: 'id', description: 'UUID dokumen' })
  @ApiResponse({ status: 200, description: 'Berhasil diperbarui' })
  @ApiResponse({ status: 403, description: 'Forbidden 鈥?hanya admin' })
  @ApiResponse({ status: 404, description: 'Tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDocumentDto>,
  ) {
    return this.svc.update(id, dto);
  }

  // 鈹€鈹€ PUT /api/documents/with-file/:id (multipart) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Put('with-file/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update dokumen + ganti file (opsional)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(MULTIPART_SCHEMA)
  @ApiParam({ name: 'id', description: 'UUID dokumen' })
  @ApiResponse({ status: 200, description: 'Berhasil diperbarui' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: docFileFilter,
      limits: { fileSize: Infinity },
    }),
  )
  async updateWithFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('departemenId')     departemenId: string,
    @Body('jenisDokumen')     jenisDokumen: string,
    @Body('namaDokumen')      namaDokumen: string,
    @Body('nomorDokumen')     nomorDokumen: string,
    @Body('revisi')           revisi: string,
    @Body('tanggalTerbit')    tanggalTerbit: string,
    @Body('statusDokumen')    statusDokumen: string,
    @Body('statusDistribusi') statusDistribusi: string,
    @Body('statusValidasi')   statusValidasi: string,
    @Body('parentId')         parentId: string,
  ) {
    const fileUrl = await this.storageService.uploadOptional(file, 'documents');
    const dto: Partial<CreateDocumentDto> = {};
    if (departemenId)     dto.departemenId     = departemenId;
    if (jenisDokumen)     dto.jenisDokumen     = jenisDokumen as any;
    if (namaDokumen)      dto.namaDokumen      = namaDokumen;
    if (nomorDokumen)     dto.nomorDokumen     = nomorDokumen;
    if (revisi)           dto.revisi           = revisi;
    if (tanggalTerbit)    dto.tanggalTerbit    = tanggalTerbit;
    if (statusDokumen)    dto.statusDokumen    = statusDokumen as any;
    if (statusDistribusi) dto.statusDistribusi = statusDistribusi as any;
    if (statusValidasi)   dto.statusValidasi   = statusValidasi as any;
    if (parentId !== undefined) dto.parentId   = parentId || undefined;
    return this.svc.update(id, dto, fileUrl);
  }

  // 鈹€鈹€ DELETE /api/documents/:id 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus dokumen (children kehilangan parent, tidak ikut terhapus)' })
  @ApiParam({ name: 'id', description: 'UUID dokumen' })
  @ApiResponse({ status: 200, description: 'Berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Forbidden 鈥?hanya admin' })
  @ApiResponse({ status: 404, description: 'Tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}

