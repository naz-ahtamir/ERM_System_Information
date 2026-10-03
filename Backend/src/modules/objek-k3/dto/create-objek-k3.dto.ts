import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  Perusahaan,
  KategoriObjek,
  StatusKelayakan,
  StatusRiksaUji,
  StatusAman,
} from '@prisma/client';

export class CreateObjekK3Dto {
  @ApiProperty({ 
    description: 'Perusahaan', 
    enum: Perusahaan,
    example: 'QMB' 
  })
  @IsEnum(Perusahaan)
  perusahaan: Perusahaan;

  @ApiProperty({ 
    description: 'Kategori objek K3', 
    enum: KategoriObjek,
    example: 'APAR' 
  })
  @IsEnum(KategoriObjek)
  kategori: KategoriObjek;

  @ApiProperty({ 
    description: 'Nama alat', 
    example: 'APAR Dry Chemical 6kg' 
  })
  @IsString()
  @IsNotEmpty()
  namaAlat: string;

  @ApiProperty({ 
    description: 'Nomor seri alat', 
    example: 'QMB-APAR-001' 
  })
  @IsString()
  @IsNotEmpty()
  noSeri: string;

  @ApiProperty({ 
    description: 'Jumlah alat', 
    example: 10 
  })
  @IsInt()
  @Min(1)
  jumlah: number;

  @ApiProperty({ 
    description: 'ID departemen', 
    example: 'DEP-001' 
  })
  @IsString()
  @IsNotEmpty()
  departemenId: string;

  @ApiProperty({ 
    description: 'Lokasi alat', 
    example: 'Gudang B, Rak 5' 
  })
  @IsString()
  @IsNotEmpty()
  lokasi: string;

  @ApiPropertyOptional({ 
    description: 'Kapasitas alat', 
    example: 6 
  })
  @IsNumber()
  @IsOptional()
  kapasitas?: number;

  @ApiPropertyOptional({ 
    description: 'Satuan', 
    example: 'kg' 
  })
  @IsString()
  @IsOptional()
  satuan?: string;

  @ApiPropertyOptional({ 
    description: 'Tahun pemasangan', 
    example: 2024 
  })
  @IsInt()
  @IsOptional()
  tahunPemasangan?: number;

  @ApiPropertyOptional({ 
    description: 'Kondisi pemasangan', 
    example: 'Baik' 
  })
  @IsString()
  @IsOptional()
  kondisiPemasangan?: string;

  @ApiPropertyOptional({ 
    description: 'URL gambar pengesahan', 
    example: '/uploads/objek-k3/1234567890.jpg' 
  })
  @IsString()
  @IsOptional()
  pengesahanGambar?: string;

  @ApiPropertyOptional({ 
    description: 'Tanggal pengujian pertama', 
    example: '2025-01-15' 
  })
  @IsString()
  @IsOptional()
  tanggalPengujianPertama?: string;

  @ApiPropertyOptional({ 
    description: 'Tanggal pengujian berkala', 
    example: '2026-01-15' 
  })
  @IsString()
  @IsOptional()
  tanggalPengujianBerkala?: string;

  @ApiPropertyOptional({ 
    description: 'Status kelayakan', 
    enum: StatusKelayakan,
    example: 'LAYAK' 
  })
  @IsEnum(StatusKelayakan)
  @IsOptional()
  statusKelayakan?: StatusKelayakan;

  @ApiPropertyOptional({ 
    description: 'Status riksa uji', 
    enum: StatusRiksaUji,
    example: 'SUDAH_RIKSA' 
  })
  @IsEnum(StatusRiksaUji)
  @IsOptional()
  statusRiksaUji?: StatusRiksaUji;

  @ApiPropertyOptional({ 
    description: 'Nomor suket', 
    example: 'SKT-001' 
  })
  @IsString()
  @IsOptional()
  noSuket?: string;

  @ApiPropertyOptional({ 
    description: 'Tanggal riksa uji terakhir', 
    example: '2025-01-10' 
  })
  @IsString()
  @IsOptional()
  tanggalRiksaUjiTerakhir?: string;

  @ApiPropertyOptional({ 
    description: 'Tanggal berlaku', 
    example: '2026-01-10' 
  })
  @IsString()
  @IsOptional()
  tanggalBerlaku?: string;

  @ApiPropertyOptional({ 
    description: 'Status aman', 
    enum: StatusAman,
    example: 'AMAN' 
  })
  @IsEnum(StatusAman)
  @IsOptional()
  statusAman?: StatusAman;

  @ApiPropertyOptional({ 
    description: 'Jadwal riksa uji', 
    example: '6 bulan sekali' 
  })
  @IsString()
  @IsOptional()
  jadwalRiksaUji?: string;

  @ApiPropertyOptional({ 
    description: 'LHU tersedia', 
    enum: ['ADA', 'TIDAK ADA'],
    example: 'ADA' 
  })
  @IsString()
  @IsOptional()
  lhu?: string;

  @ApiPropertyOptional({ 
    description: 'URL file LHU', 
    example: '/uploads/objek-k3/1234567890.pdf' 
  })
  @IsString()
  @IsOptional()
  fileLHU?: string;

  @ApiPropertyOptional({ 
    description: 'LHU ada', 
    example: 'ADA' 
  })
  @IsString()
  @IsOptional()
  lhuAda?: string;

  @ApiPropertyOptional({ 
    description: 'Nomor LHU', 
    example: 'LHU-001' 
  })
  @IsString()
  @IsOptional()
  noLHU?: string;

  @ApiPropertyOptional({ 
    description: 'URL foto alat', 
    example: '/uploads/objek-k3/1234567890.jpg' 
  })
  @IsString()
  @IsOptional()
  fotoAlat?: string;

  @ApiPropertyOptional({ 
    description: 'URL foto tagging', 
    example: '/uploads/objek-k3/1234567890.jpg' 
  })
  @IsString()
  @IsOptional()
  fotoTagging?: string;

  @ApiPropertyOptional({ 
    description: 'URL sertifikat', 
    example: '/uploads/objek-k3/1234567890.pdf' 
  })
  @IsString()
  @IsOptional()
  sertifikat?: string;

  @ApiPropertyOptional({ 
    description: 'URL laporan pemeriksaan', 
    example: '/uploads/objek-k3/1234567890.pdf' 
  })
  @IsString()
  @IsOptional()
  laporanPemeriksaan?: string;

  @ApiPropertyOptional({ 
    description: 'Catatan', 
    example: 'Alat dalam kondisi baik' 
  })
  @IsString()
  @IsOptional()
  catatan?: string;
}
