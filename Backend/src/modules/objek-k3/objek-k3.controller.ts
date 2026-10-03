import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ObjekK3Service } from './objek-k3.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { UpdateObjekK3Dto } from './dto/update-objek-k3.dto';
import { CreateRiwayatDto } from './dto/create-riwayat.dto';

const LIMIT  = { fileSize: Infinity }; // no limit

type UploadedObjekFiles = {
  pengesahanGambar?: Express.Multer.File[];
  fileLHU?: Express.Multer.File[];
  fotoAlat?: Express.Multer.File[];
  fotoTagging?: Express.Multer.File[];
  sertifikat?: Express.Multer.File[];
  laporanPemeriksaan?: Express.Multer.File[];
};

const FILE_FIELDS_OBJEK = [
  { name: 'pengesahanGambar', maxCount: 1 },
  { name: 'fileLHU', maxCount: 1 },
  { name: 'fotoAlat', maxCount: 1 },
  { name: 'fotoTagging', maxCount: 1 },
  { name: 'sertifikat', maxCount: 1 },
  { name: 'laporanPemeriksaan', maxCount: 1 },
];

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
function fileFilter(_req: any, file: Express.Multer.File, cb: any) {
  cb(null, ALLOWED_EXT.includes(extname(file.originalname).toLowerCase()));
}

const OBJEK_MULTIPART_SCHEMA = {
  schema: {
    type: 'object',
    properties: {
      perusahaan:              { type: 'string', example: 'QMB' },
      kategori:                { type: 'string', example: 'APAR' },
      namaAlat:                { type: 'string', example: 'APAR Dry Chemical 6kg' },
      noSeri:                  { type: 'string', example: 'QMB-APAR-001' },
      jumlah:                  { type: 'integer', example: 10 },
      departemenId:            { type: 'string', example: 'DEP-001' },
      lokasi:                  { type: 'string', example: 'Gudang B, Rak 5' },
      kapasitas:               { type: 'number', example: 6 },
      satuan:                  { type: 'string', example: 'kg' },
      tahunPemasangan:         { type: 'integer', example: 2024 },
      kondisiPemasangan:       { type: 'string', example: 'Baik' },
      statusKelayakan:         { type: 'string', example: 'LAYAK' },
      statusRiksaUji:          { type: 'string', example: 'SUDAH_RIKSA' },
      statusAman:              { type: 'string', example: 'AMAN' },
      tanggalPengujianPertama: { type: 'string', format: 'date', example: '2025-01-15' },
      tanggalPengujianBerkala: { type: 'string', format: 'date', example: '2026-01-15' },
      noSuket:                 { type: 'string', example: 'SKT-001' },
      tanggalRiksaUjiTerakhir: { type: 'string', format: 'date', example: '2025-01-10' },
      tanggalBerlaku:          { type: 'string', format: 'date', example: '2026-01-10' },
      jadwalRiksaUji:          { type: 'string', example: '6 bulan sekali' },
      lhu:                     { type: 'string', enum: ['ADA', 'TIDAK ADA'], example: 'ADA' },
      noLHU:                   { type: 'string', example: 'LHU-001' },
      catatan:                 { type: 'string', example: 'Alat dalam kondisi baik' },
      pengesahanGambar:        { type: 'string', format: 'binary' },
      fileLHU:                 { type: 'string', format: 'binary' },
      fotoAlat:                { type: 'string', format: 'binary' },
      fotoTagging:             { type: 'string', format: 'binary' },
      sertifikat:              { type: 'string', format: 'binary' },
      laporanPemeriksaan:      { type: 'string', format: 'binary' },
    },
  },
};

@ApiTags('Objek K3')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/objek-k3')
export class ObjekK3Controller {
  constructor(
    private readonly service: ObjekK3Service,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // 鈹€鈹€ GET all 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get()
  @ApiOperation({ summary: 'Get all Objek K3 (with optional filters)' })
  @ApiQuery({ name: 'perusahaan',       required: false, type: 'string' })
  @ApiQuery({ name: 'kategori',         required: false, type: 'string' })
  @ApiQuery({ name: 'statusKelayakan',  required: false, type: 'string' })
  @ApiQuery({ name: 'statusRiksaUji',   required: false, type: 'string' })
  @ApiQuery({ name: 'statusAman',       required: false, type: 'string' })
  @ApiQuery({ name: 'search',           required: false, type: 'string' })
  @ApiResponse({ status: 200, description: 'List of Objek K3' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('perusahaan')      perusahaan?: string,
    @Query('kategori')        kategori?: string,
    @Query('statusKelayakan') statusKelayakan?: string,
    @Query('statusRiksaUji')  statusRiksaUji?: string,
    @Query('statusAman')      statusAman?: string,
    @Query('search')          search?: string,
  ) {
    return this.service.findAll({ perusahaan, kategori, statusKelayakan, statusRiksaUji, statusAman, search });
  }

  // 鈹€鈹€ GET one 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get(':id')
  @ApiOperation({ summary: 'Get one Objek K3 by ID' })
  @ApiParam({ name: 'id', description: 'Objek K3 ID' })
  @ApiResponse({ status: 200, description: 'Objek K3 detail' })
  @ApiResponse({ status: 404, description: 'Objek K3 not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 鈹€鈹€ POST create 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Post()
  @ApiOperation({ summary: 'Create Objek K3 with optional file uploads (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(OBJEK_MULTIPART_SCHEMA)
  @ApiResponse({ status: 201, description: 'Objek K3 created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileFieldsInterceptor(FILE_FIELDS_OBJEK, { storage: memoryStorage(), fileFilter, limits: LIMIT }))
  async create(
    @Request() req,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: UploadedObjekFiles,
  ) {
    const dto = await this.parseBody(body, files);
    return this.service.create(req.user.id, dto as any);
  }

  // 鈹€鈹€ PUT update 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Put(':id')
  @ApiOperation({ summary: 'Update Objek K3 with optional file uploads (multipart/form-data)' })
  @ApiParam({ name: 'id', description: 'Objek K3 ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(OBJEK_MULTIPART_SCHEMA)
  @ApiResponse({ status: 200, description: 'Objek K3 updated successfully' })
  @ApiResponse({ status: 404, description: 'Objek K3 not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileFieldsInterceptor(FILE_FIELDS_OBJEK, { storage: memoryStorage(), fileFilter, limits: LIMIT }))
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: UploadedObjekFiles,
  ) {
    const dto = await this.parseBody(body, files);
    return this.service.update(id, req.user.id, dto as any);
  }

  // 鈹€鈹€ DELETE 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Objek K3 (admin only)' })
  @ApiParam({ name: 'id', description: 'Objek K3 ID' })
  @ApiResponse({ status: 200, description: 'Objek K3 deleted successfully' })
  @ApiResponse({ status: 404, description: 'Objek K3 not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.id);
  }

  // 鈹€鈹€ Riwayat Pemeriksaan 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Post(':id/riwayat')
  @ApiOperation({ summary: 'Add riwayat pemeriksaan to Objek K3' })
  @ApiParam({ name: 'id', description: 'Objek K3 ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tanggal:     { type: 'string', format: 'date', example: '2026-10-15' },
        hasil:       { type: 'string', enum: ['LAYAK', 'TIDAK LAYAK', 'PERLU PERBAIKAN'], example: 'LAYAK' },
        catatan:     { type: 'string', example: 'Alat dalam kondisi baik' },
        fileLaporan: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Riwayat added successfully' })
  @ApiResponse({ status: 404, description: 'Objek K3 not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'fileLaporan', maxCount: 1 }], { storage: memoryStorage(), fileFilter, limits: LIMIT }),
  )
  async addRiwayat(
    @Param('id') objekK3Id: string,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: { fileLaporan?: Express.Multer.File[] },
  ) {
    const fileLaporan = files?.fileLaporan?.[0]
      ? await this.storageService.upload(
          files.fileLaporan[0].buffer,
          files.fileLaporan[0].originalname,
          files.fileLaporan[0].mimetype,
          'objek-k3',
        )
      : undefined;

    const dto: CreateRiwayatDto = {
      tanggal:     body.tanggal,
      hasil:       body.hasil,
      catatan:     body.catatan,
      fileLaporan,
    };
    return this.service.addRiwayat(objekK3Id, dto);
  }

  @Delete('riwayat/:riwayatId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete riwayat pemeriksaan (admin only)' })
  @ApiParam({ name: 'riwayatId', description: 'Riwayat ID' })
  @ApiResponse({ status: 200, description: 'Riwayat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Riwayat not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeRiwayat(@Param('riwayatId') riwayatId: string, @Request() req) {
    return this.service.removeRiwayat(riwayatId, req.user.id);
  }

  // 鈹€鈹€ Private helpers 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  private async parseBody(body: Record<string, string>, files: UploadedObjekFiles): Promise<UpdateObjekK3Dto> {
    const n = (v?: string) => (v !== undefined && v !== '' ? Number(v) : undefined);

    // Upload each file field to Supabase and resolve URL
    const uploadField = async (key: keyof UploadedObjekFiles): Promise<string | undefined> => {
      const file = files?.[key]?.[0];
      if (!file) return undefined;
      return this.storageService.upload(file.buffer, file.originalname, file.mimetype, 'objek-k3');
    };

    const [
      pengesahanGambar,
      fileLHU,
      fotoAlat,
      fotoTagging,
      sertifikat,
      laporanPemeriksaan,
    ] = await Promise.all([
      uploadField('pengesahanGambar'),
      uploadField('fileLHU'),
      uploadField('fotoAlat'),
      uploadField('fotoTagging'),
      uploadField('sertifikat'),
      uploadField('laporanPemeriksaan'),
    ]);

    return {
      perusahaan:              body.perusahaan as any,
      kategori:                body.kategori as any,
      namaAlat:                body.namaAlat,
      noSeri:                  body.noSeri,
      jumlah:                  body.jumlah ? Number(body.jumlah) : undefined,
      departemenId:            body.departemenId,
      lokasi:                  body.lokasi,
      kapasitas:               n(body.kapasitas),
      satuan:                  body.satuan  || undefined,
      tahunPemasangan:         n(body.tahunPemasangan),
      kondisiPemasangan:       body.kondisiPemasangan       || undefined,
      statusKelayakan:         body.statusKelayakan         as any || undefined,
      statusRiksaUji:          body.statusRiksaUji          as any || undefined,
      statusAman:              body.statusAman              as any || undefined,
      noSuket:                 body.noSuket                 || undefined,
      tanggalPengujianPertama: body.tanggalPengujianPertama || undefined,
      tanggalPengujianBerkala: body.tanggalPengujianBerkala || undefined,
      tanggalRiksaUjiTerakhir: body.tanggalRiksaUjiTerakhir || undefined,
      tanggalBerlaku:          body.tanggalBerlaku          || undefined,
      jadwalRiksaUji:          body.jadwalRiksaUji          || undefined,
      lhu:                     body.lhu                     || undefined,
      lhuAda:                  body.lhuAda                  || undefined,
      noLHU:                   body.noLHU                   || undefined,
      catatan:                 body.catatan                 || undefined,
      // Supabase public URLs
      pengesahanGambar,
      fileLHU,
      fotoAlat,
      fotoTagging,
      sertifikat,
      laporanPemeriksaan,
    };
  }
}

