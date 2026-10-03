import { IsString, IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';
import { KategoriPica, JenisTemuan } from '@prisma/client';

export class CreatePicaDto {
  @IsString()
  temuanMasalah: string;

  @IsString()
  kriteriaId: string;

  @IsOptional()
  @IsString()
  kriteriaDeskripsi?: string;

  @IsEnum(KategoriPica)
  kategori: KategoriPica;

  @IsString()
  lokasiDivisiId: string;

  @IsOptional()
  @IsString()
  lokasiDivisiNama?: string;

  @IsOptional()
  @IsString()
  dokumentasiTemuanTeks?: string;

  @IsDateString()
  tanggalTemuan: string;

  @IsEnum(JenisTemuan)
  jenisTemuan: JenisTemuan;

  @IsArray()
  @IsString({ each: true })
  hierarkiPengendalian: string[];

  @IsString()
  rekomendasiPerbaikan: string;

  @IsString()
  picId: string;

  @IsString()
  picNama: string;

  @IsString()
  divisiId: string;

  @IsDateString()
  batasAkhir: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}
