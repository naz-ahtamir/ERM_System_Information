import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDivisionDto {
  @ApiProperty({ example: 'PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT' })
  @IsString()
  @MaxLength(300)
  name: string;

  @ApiProperty({ description: 'UUID departemen' })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ description: 'UUID user yang menjadi PIC divisi (wajib)' })
  @IsUUID()
  picId: string;
}

export class UpdateDivisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  picId?: string;
}
