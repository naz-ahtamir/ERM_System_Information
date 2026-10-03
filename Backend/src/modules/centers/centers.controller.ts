import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CentersService } from './centers.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/create-center.dto';

@ApiTags('Centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/centers')
export class CentersController {
  constructor(private readonly svc: CentersService) {}

  @Get()
  @ApiOperation({ summary: 'List semua pusat' })
  @ApiResponse({ status: 200 })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Detail pusat (include departments)' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah pusat baru' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Kode sudah dipakai' })
  create(@Body() dto: CreateCenterDto) { return this.svc.create(dto); }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update pusat' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateCenterDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus pusat (gagal jika masih ada departemen)' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
