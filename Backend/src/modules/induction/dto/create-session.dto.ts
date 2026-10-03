import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ 
    description: 'Tanggal pelatihan', 
    example: '2026-10-15' 
  })
  @IsDateString()
  tanggal: string;

  @ApiProperty({ 
    description: 'Lokasi pelatihan', 
    example: 'Ruang Meeting Lantai 3' 
  })
  @IsString()
  lokasi: string;

  @ApiPropertyOptional({ 
    description: 'Topik pelatihan', 
    example: 'Keselamatan Kerja Listrik' 
  })
  @IsOptional()
  @IsString()
  topik?: string;

  @ApiPropertyOptional({ 
    description: 'Deskripsi pelatihan', 
    example: 'Pelatihan dasar keselamatan kerja listrik untuk semua karyawan' 
  })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional({ 
    description: 'ID PIC pelatihan', 
    example: 'EMP-001' 
  })
  @IsOptional()
  @IsString()
  picId?: string;

  @ApiPropertyOptional({ 
    description: 'Status pelatihan', 
    enum: ['DRAFT', 'ACTIVE', 'COMPLETED'],
    example: 'ACTIVE' 
  })
  @IsOptional()
  @IsString()
  status?: string;
}
