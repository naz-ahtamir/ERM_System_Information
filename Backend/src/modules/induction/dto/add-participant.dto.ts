import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class AddParticipantDto {
  @ApiPropertyOptional({ 
    description: 'ID user (jika internal karyawan)', 
    example: 'EMP-001' 
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ 
    description: 'Nama peserta', 
    example: 'Budi Santoso' 
  })
  @IsString()
  nama: string;

  @ApiPropertyOptional({ 
    description: 'Nama perusahaan (jika contraktor/tamu)', 
    example: 'PT Kontraktor A' 
  })
  @IsOptional()
  @IsString()
  perusahaan?: string;

  @ApiPropertyOptional({ 
    description: 'NIK / KTP / Paspor', 
    example: '3171717171717171' 
  })
  @IsOptional()
  @IsString()
  identitas?: string;

  @ApiPropertyOptional({ 
    description: 'No telepon', 
    example: '081234567890' 
  })
  @IsOptional()
  @IsString()
  noTelp?: string;

  @ApiPropertyOptional({ 
    description: 'Email', 
    example: 'budi.santoso@example.com' 
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Jabatan', 
    example: 'Staff HSE' 
  })
  @IsOptional()
  @IsString()
  jabatan?: string;

  @ApiPropertyOptional({ 
    description: 'Jenis kelamin', 
    example: 'Laki-laki' 
  })
  @IsOptional()
  @IsString()
  jenisKelamin?: string;

  @ApiPropertyOptional({ 
    description: 'Tipe peserta', 
    enum: ['KARYAWAN_BARU', 'KONTRAKTOR', 'TAMU', 'SUPPLIER', 'MAGANG'],
    example: 'KARYAWAN_BARU' 
  })
  @IsOptional()
  @IsString()
  tipe?: string;

  @ApiPropertyOptional({ 
    description: 'Metode scan', 
    enum: ['QR', 'MANUAL'],
    example: 'QR' 
  })
  @IsOptional()
  @IsString()
  scanMethod?: string;
}
