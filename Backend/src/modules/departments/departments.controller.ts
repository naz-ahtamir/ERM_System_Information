import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiResponse, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpsertDepartmentsDto } from './dto/create-department.dto';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('api/departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly svc: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List semua departemen (filter opsional by centerId)' })
  @ApiQuery({ name: 'centerId', required: false })
  @ApiResponse({ status: 200 })
  findAll(@Query('centerId') centerId?: string) {
    return this.svc.findAll(centerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu departemen (include center & divisions)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah satu departemen baru' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Kode sudah ada' })
  create(@Body() dto: CreateDepartmentDto) { return this.svc.create(dto); }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Seed / upsert banyak departemen sekaligus (idempotent)' })
  @ApiResponse({ status: 200 })
  seed(@Body() dto: UpsertDepartmentsDto) { return this.svc.upsertMany(dto.departments); }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update departemen (termasuk assign centerId)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus departemen (gagal jika masih ada divisi)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
