import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export enum JenisDokumen {
  MANUAL          = 'MANUAL',
  SOP             = 'SOP',
  INSTRUKSI_KERJA = 'INSTRUKSI_KERJA',
  FORMULIR        = 'FORMULIR',
}

export enum StatusDokumen {
  ASLI           = 'ASLI',
  SALINAN        = 'SALINAN',
  ASLI_REVISI    = 'ASLI_REVISI',
  SALINAN_REVISI = 'SALINAN_REVISI',
}

export enum StatusDistribusi {
  TERKENDALI       = 'TERKENDALI',
  TIDAK_TERKENDALI = 'TIDAK_TERKENDALI',
}

export enum StatusValidasi {
  BERLAKU       = 'BERLAKU',
  TIDAK_BERLAKU = 'TIDAK_BERLAKU',
  PEMUSNAHAN    = 'PEMUSNAHAN',
}

export class CreateDocumentDto {
  @ApiProperty({ example: 'uuid-departemen', description: 'UUID departemen pemilik dokumen' })
  @IsString()
  @IsNotEmpty()
  departemenId: string;

  @ApiProperty({ enum: JenisDokumen, example: JenisDokumen.SOP, description: 'Jenis dokumen: MANUAL | SOP | INSTRUKSI_KERJA | FORMULIR' })
  @IsEnum(JenisDokumen)
  jenisDokumen: JenisDokumen;

  @ApiProperty({ example: 'SOP Penanganan Limbah B3', description: 'Nama / judul lengkap dokumen', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaDokumen: string;

  @ApiProperty({ example: 'SOP-HSE-001', description: 'Nomor dokumen unik', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nomorDokumen: string;

  @ApiPropertyOptional({ example: '00', description: 'Nomor revisi (default "00")' })
  @IsOptional()
  @IsString()
  revisi?: string;

  @ApiProperty({ example: '2025-01-15', description: 'Tanggal terbit dokumen (ISO 8601)' })
  @IsDateString()
  tanggalTerbit: string;

  @ApiProperty({ enum: StatusDokumen, example: StatusDokumen.ASLI })
  @IsEnum(StatusDokumen)
  statusDokumen: StatusDokumen;

  @ApiProperty({ enum: StatusDistribusi, example: StatusDistribusi.TERKENDALI })
  @IsEnum(StatusDistribusi)
  statusDistribusi: StatusDistribusi;

  @ApiProperty({ enum: StatusValidasi, example: StatusValidasi.BERLAKU })
  @IsEnum(StatusValidasi)
  statusValidasi: StatusValidasi;

  @ApiPropertyOptional({
    example: 'uuid-parent',
    description:
      'UUID dokumen parent (opsional). Parent harus level lebih tinggi: ' +
      'SOP/IK/Formulir dapat merujuk ke MANUAL, IK/Formulir ke SOP, dsb.',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
