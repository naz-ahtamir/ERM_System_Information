import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRiwayatDto {
  @ApiProperty({ 
    description: 'Tanggal kejadian', 
    example: '2026-10-15' 
  })
  @IsString()
  @IsNotEmpty()
  tanggal: string;

  @ApiProperty({ 
    description: 'Hasil pemeriksaan', 
    enum: ['LAYAK', 'TIDAK LAYAK', 'PERLU PERBAIKAN'],
    example: 'LAYAK' 
  })
  @IsString()
  @IsNotEmpty()
  hasil: string;

  @ApiPropertyOptional({ 
    description: 'Catatan', 
    example: 'Alat dalam kondisi baik untuk digunakan' 
  })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({ 
    description: 'URL file laporan', 
    example: '/uploads/objek-k3/1234567890.pdf' 
  })
  @IsOptional()
  @IsString()
  fileLaporan?: string;
}
