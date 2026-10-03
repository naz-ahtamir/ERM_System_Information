import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateFindingDto {
  @ApiProperty({ description: 'ID sub element yang ditemukan', example: 'SE-001' })
  @IsString()
  @IsNotEmpty()
  subElementId: string;

  @ApiProperty({ description: 'Judul temuan', example: 'Tidak ada APAR di area A' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ 
    description: 'Status temuan', 
    enum: ['INPG', 'CLSD'], 
    example: 'INPG' 
  })
  @IsEnum(['INPG', 'CLSD'])
  @IsOptional()
  findingStatus?: 'INPG' | 'CLSD';

  @ApiPropertyOptional({ 
    description: 'Data temuan dalam format JSON', 
    example: { detail: 'APAR tidak ada di dinding' } 
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Files terkait temuan', 
    type: 'string', 
    format: 'binary' 
  })
  @IsOptional()
  files?: any;
}
