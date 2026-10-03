import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt, Min } from 'class-validator';
import { DrillType } from '@prisma/client';

export class CreateEmergencyDrillDto {
  // ── PLAN fields (wajib) ────────────────────────────────────────────────

  @ApiProperty({ description: 'Tanggal pelaksanaan rencana latihan', example: '2026-10-15' })
  @IsDateString()
  @IsNotEmpty()
  planDate: string;

  @ApiProperty({ description: 'Jenis latihan darurat', enum: DrillType, example: 'Fire' })
  @IsEnum(DrillType)
  @IsNotEmpty()
  drillType: DrillType;

  @ApiProperty({ description: 'Skenario latihan', example: 'Kebakaran di gudang B' })
  @IsString()
  @IsNotEmpty()
  scenario: string;

  @ApiProperty({ description: 'ID departemen pelaksana', example: 'DEP-001' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ description: 'Divisi pelaksana', example: 'Production' })
  @IsString()
  @IsNotEmpty()
  division: string;

  @ApiProperty({ description: 'Nama PIC pelaksanaan rencana', example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  picPlan: string;

  @ApiPropertyOptional({ description: 'Catatan rencana latihan', example: 'Siapkan APAR di area A' })
  @IsString()
  @IsOptional()
  notesPlan?: string;

  // ── ACTUAL fields (opsional — bisa diisi kemudian via update) ──────────

  @ApiPropertyOptional({ description: 'Tanggal pelaksanaan aktual', example: '2026-10-15' })
  @IsDateString()
  @IsOptional()
  actualDate?: string;

  @ApiPropertyOptional({ description: 'Lokasi pelaksanaan aktual', example: 'Area produksi lantai 2' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Jumlah TKA yang terlibat', example: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalTKA?: number;

  @ApiPropertyOptional({ description: 'Jumlah TKI yang terlibat', example: 20 })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalTKI?: number;

  @ApiPropertyOptional({ description: 'Jumlah staff lainnya', example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalStaff?: number;

  @ApiPropertyOptional({ description: 'Durasi latihan', example: '02:30' })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional({ description: 'Nama PIC pelaksanaan aktual', example: 'Agus Wibowo' })
  @IsString()
  @IsOptional()
  picActual?: string;

  @ApiPropertyOptional({ description: 'Catatan pelaksanaan aktual', example: 'Semua peserta antusias' })
  @IsString()
  @IsOptional()
  notesActual?: string;

  // File fields — diisi controller setelah upload
  @ApiPropertyOptional({ description: 'URL foto dokumentasi', example: '/uploads/emergency-drill/1234567890.jpg' })
  @IsString()
  @IsOptional()
  photoDocumentation?: string;

  @ApiPropertyOptional({ description: 'URL daftar hadir', example: '/uploads/emergency-drill/1234567890.pdf' })
  @IsString()
  @IsOptional()
  attendanceList?: string;

  @ApiPropertyOptional({ description: 'URL laporan latihan', example: '/uploads/emergency-drill/1234567890.pdf' })
  @IsString()
  @IsOptional()
  drillReport?: string;
}
