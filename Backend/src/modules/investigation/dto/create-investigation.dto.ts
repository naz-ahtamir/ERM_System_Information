import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { JenisKecelakaan } from '@prisma/client';

export class CreateInvestigationDto {
  // ── Data Kecelakaan (wajib) ────────────────────────────────────────────────

  @ApiProperty({ description: 'Tanggal kejadian', example: '2026-09-01' })
  @IsDateString()
  @IsNotEmpty()
  tanggalKejadian: string;

  @ApiProperty({ description: 'Waktu kejadian', example: '08:30' })
  @IsString()
  @IsNotEmpty()
  waktuKejadian: string;

  @ApiProperty({ description: 'Lokasi kejadian', example: 'Gedung A lantai 2' })
  @IsString()
  @IsNotEmpty()
  lokasi: string;

  @ApiProperty({ description: 'Area / zona kerja', example: 'Area Produksi' })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiProperty({ description: 'Deskripsi kronologi kejadian', example: 'Karyawan terjatuh saat...' })
  @IsString()
  @IsNotEmpty()
  deskripsiKejadian: string;

  @ApiProperty({ description: 'Jenis kecelakaan', enum: JenisKecelakaan })
  @IsEnum(JenisKecelakaan)
  @IsNotEmpty()
  jenisKecelakaan: JenisKecelakaan;

  @ApiPropertyOptional({ description: 'Jumlah korban', example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  jumlahKorban?: number;

  @ApiPropertyOptional({ description: 'Daftar korban (JSON array)', example: '[{"nama":"Budi","jabatan":"Operator"}]' })
  @IsString()
  @IsOptional()
  daftarKorban?: string; // JSON string dari form-data; controller akan parse

  @ApiPropertyOptional({ description: 'Nama saksi kejadian', example: 'Agus, Rina' })
  @IsString()
  @IsOptional()
  saksi?: string;

  @ApiPropertyOptional({ description: 'Kerugian material', example: 'Mesin press rusak ~Rp 5jt' })
  @IsString()
  @IsOptional()
  kerugianMaterial?: string;

  // File path — diisi controller setelah upload
  @ApiPropertyOptional({ description: 'URL foto bukti kejadian' })
  @IsString()
  @IsOptional()
  fotoBukti?: string;
}
