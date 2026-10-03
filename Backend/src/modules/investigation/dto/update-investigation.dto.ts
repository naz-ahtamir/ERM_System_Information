import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { CreateInvestigationDto } from './create-investigation.dto';

export class UpdateInvestigationDto extends PartialType(CreateInvestigationDto) {
  // ── Data Investigasi (diisi saat UNDER_INVESTIGATION) ──────────────────────

  @ApiPropertyOptional({ description: 'ID investigator (user)' })
  @IsString()
  @IsOptional()
  investigatorId?: string;

  @ApiPropertyOptional({ description: 'Tanggal investigasi dilakukan', example: '2026-09-05' })
  @IsDateString()
  @IsOptional()
  tanggalInvestigasi?: string;

  @ApiPropertyOptional({ description: 'Analisis akar masalah / root cause' })
  @IsString()
  @IsOptional()
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Temuan hasil investigasi' })
  @IsString()
  @IsOptional()
  temuanInvestigasi?: string;

  @ApiPropertyOptional({ description: 'Rekomendasi perbaikan' })
  @IsString()
  @IsOptional()
  rekomendasiPerbaikan?: string;

  @ApiPropertyOptional({ description: 'URL lampiran laporan PDF' })
  @IsString()
  @IsOptional()
  lampiranLaporan?: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan' })
  @IsString()
  @IsOptional()
  catatanTambahan?: string;
}
