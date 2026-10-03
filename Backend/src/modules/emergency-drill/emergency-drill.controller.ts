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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EmergencyDrillService } from './emergency-drill.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreateEmergencyDrillDto } from './dto/create-emergency-drill.dto';
import { UpdateEmergencyDrillDto } from './dto/update-emergency-drill.dto';

// 鈹€鈹€ Upload config 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function fileFilter(_req: any, file: Express.Multer.File, cb: any) {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];
  cb(null, allowed.includes(extname(file.originalname).toLowerCase()));
}

const LIMITS = { fileSize: Infinity }; // no limit

type UploadedDrillFiles = {
  photoDocumentation?: Express.Multer.File[];
  attendanceList?: Express.Multer.File[];
  drillReport?: Express.Multer.File[];
};

const FILE_FIELDS = [
  { name: 'photoDocumentation', maxCount: 1 },
  { name: 'attendanceList',     maxCount: 1 },
  { name: 'drillReport',        maxCount: 1 },
];

@ApiTags('Emergency Drill')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/emergency-drill')
export class EmergencyDrillController {
  constructor(
    private readonly service: EmergencyDrillService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // 鈹€鈹€ GET all 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get()
  @ApiOperation({ summary: 'Get all Emergency Drills (with optional filters)' })
  @ApiResponse({
    status: 200,
    description: 'List of all emergency drills',
    type: 'array',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('status')       status?: string,
    @Query('drillType')    drillType?: string,
    @Query('departmentId') departmentId?: string,
    @Query('search')       search?: string,
  ) {
    return this.service.findAll({ status, drillType, departmentId, search });
  }

  // 鈹€鈹€ GET one 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Get(':id')
  @ApiOperation({ summary: 'Get one Emergency Drill by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Emergency Drill ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency Drill detail',
    type: CreateEmergencyDrillDto,
  })
  @ApiResponse({ status: 404, description: 'Emergency Drill not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 鈹€鈹€ POST create 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Post()
  @ApiOperation({ summary: 'Create Emergency Drill (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planDate: { type: 'string', format: 'date', example: '2026-10-15' },
        drillType: { enum: ['Fire', 'Evacuation', 'Medical', 'Spill'], example: 'Fire' },
        scenario: { type: 'string', example: 'Kebakaran di gudang B' },
        departmentId: { type: 'string', example: 'DEP-001' },
        division: { type: 'string', example: 'Production' },
        picPlan: { type: 'string', example: 'Budi Santoso' },
        notesPlan: { type: 'string', example: 'Siapkan APAR di area A' },
        photoDocumentation: { type: 'string', format: 'binary' },
        attendanceList: { type: 'string', format: 'binary' },
        drillReport: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Emergency Drill created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileFieldsInterceptor(FILE_FIELDS, { storage: memoryStorage(), fileFilter, limits: LIMITS }))
  async create(
    @Request() req,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: UploadedDrillFiles,
  ) {
    const dto = await this.parseBody(body, files) as CreateEmergencyDrillDto;
    return this.service.create(req.user.id, dto);
  }

  // 鈹€鈹€ PUT update 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Put(':id')
  @ApiOperation({ summary: 'Update Emergency Drill (multipart/form-data)' })
  @ApiParam({ name: 'id', required: true, description: 'Emergency Drill ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planDate: { type: 'string', format: 'date', example: '2026-10-15' },
        drillType: { enum: ['Fire', 'Evacuation', 'Medical', 'Spill'], example: 'Fire' },
        scenario: { type: 'string', example: 'Kebakaran di gudang B' },
        departmentId: { type: 'string', example: 'DEP-001' },
        division: { type: 'string', example: 'Production' },
        picPlan: { type: 'string', example: 'Budi Santoso' },
        notesPlan: { type: 'string', example: 'Siapkan APAR di area A' },
        actualDate: { type: 'string', format: 'date', example: '2026-10-15' },
        location: { type: 'string', example: 'Area produksi lantai 2' },
        totalTKA: { type: 'integer', example: 5 },
        totalTKI: { type: 'integer', example: 20 },
        totalStaff: { type: 'integer', example: 3 },
        duration: { type: 'string', example: '02:30' },
        picActual: { type: 'string', example: 'Agus Wibowo' },
        notesActual: { type: 'string', example: 'Semua peserta antusias' },
        photoDocumentation: { type: 'string', format: 'binary' },
        attendanceList: { type: 'string', format: 'binary' },
        drillReport: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Emergency Drill updated successfully' })
  @ApiResponse({ status: 404, description: 'Emergency Drill not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileFieldsInterceptor(FILE_FIELDS, { storage: memoryStorage(), fileFilter, limits: LIMITS }))
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: UploadedDrillFiles,
  ) {
    const dto = await this.parseBody(body, files) as UpdateEmergencyDrillDto;
    return this.service.update(id, req.user.id, dto);
  }

  // 鈹€鈹€ DELETE 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Emergency Drill (admin only)' })
  @ApiParam({ name: 'id', required: true, description: 'Emergency Drill ID' })
  @ApiResponse({ status: 200, description: 'Emergency Drill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Emergency Drill not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.id);
  }

  // 鈹€鈹€ Helpers 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  private async parseBody(
    body: Record<string, string>,
    files: UploadedDrillFiles,
  ): Promise<Partial<CreateEmergencyDrillDto>> {
    const n = (v?: string) => (v !== undefined && v !== '' ? Number(v) : undefined);

    const uploadField = async (key: keyof UploadedDrillFiles): Promise<string | undefined> => {
      const file = files?.[key]?.[0];
      if (!file) return undefined;
      return this.storageService.upload(file.buffer, file.originalname, file.mimetype, 'emergency-drill');
    };

    const [photoDocumentation, attendanceList, drillReport] = await Promise.all([
      uploadField('photoDocumentation'),
      uploadField('attendanceList'),
      uploadField('drillReport'),
    ]);

    return {
      planDate:     body.planDate     || undefined,
      drillType:    body.drillType    as any || undefined,
      scenario:     body.scenario     || undefined,
      departmentId: body.departmentId || undefined,
      division:     body.division     || undefined,
      picPlan:      body.picPlan      || undefined,
      notesPlan:    body.notesPlan    || undefined,
      actualDate:  body.actualDate  || undefined,
      location:    body.location    || undefined,
      totalTKA:    n(body.totalTKA),
      totalTKI:    n(body.totalTKI),
      totalStaff:  n(body.totalStaff),
      duration:    body.duration    || undefined,
      picActual:   body.picActual   || undefined,
      notesActual: body.notesActual || undefined,
      photoDocumentation,
      attendanceList,
      drillReport,
    };
  }
}

