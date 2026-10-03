import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiParam, ApiQuery, ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DivisionsService } from './divisions.service';
import { CreateDivisionDto, UpdateDivisionDto } from './dto/create-division.dto';

@ApiTags('Divisions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/divisions')
export class DivisionsController {
  constructor(private readonly svc: DivisionsService) {}

  @Get()
  @ApiOperation({ summary: 'List semua divisi, filter opsional by departmentId' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiResponse({ status: 200 })
  findAll(@Query('departmentId') departmentId?: string) {
    return this.svc.findAll(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail divisi (include dept, center, pic dengan idKaryawan)' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah divisi baru (picId wajib)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'Department atau User PIC tidak ditemukan' })
  create(@Body() dto: CreateDivisionDto) { return this.svc.create(dto); }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update divisi' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateDivisionDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus divisi (gagal jika masih ada user)' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
