import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFindingStatusDto {
  @ApiProperty({ 
    description: 'Status temuan', 
    enum: ['INPG', 'CLSD'], 
    example: 'INPG' 
  })
  @IsEnum(['INPG', 'CLSD'])
  @IsNotEmpty()
  findingStatus: 'INPG' | 'CLSD';

  @ApiPropertyOptional({ 
    description: 'Catatan persetujuan', 
    example: 'Temuan sudah diperbaiki' 
  })
  @IsOptional()
  @IsString()
  approvalNote?: string;

  @ApiPropertyOptional({ 
    description: 'Status persetujuan', 
    enum: ['ACC', 'TACC'], 
    example: 'ACC' 
  })
  @IsOptional()
  @IsEnum(['ACC', 'TACC'])
  approvalStatus?: 'ACC' | 'TACC';

  @ApiPropertyOptional({ 
    description: 'ID PIC yang bertanggung jawab', 
    example: 'EMP-001' 
  })
  @IsOptional()
  @IsString()
  picId?: string;

  @ApiPropertyOptional({ 
    description: 'Catatan tindak lanjut', 
    example: 'Sudah dilakukan inspeksi ulang' 
  })
  @IsOptional()
  @IsString()
  followUpNote?: string;

  @ApiPropertyOptional({ 
    description: 'Deadline tindak lanjut', 
    example: '2026-10-15' 
  })
  @IsOptional()
  @IsString()
  followUpDeadline?: string;
}
