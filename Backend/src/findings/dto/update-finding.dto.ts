import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateFindingDto {
  @ApiPropertyOptional({ 
    description: 'Judul temuan yang baru', 
    example: 'Tidak ada APAR di area B' 
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ 
    description: 'Data temuan baru dalam format JSON', 
    example: { detail: 'APAR tidak ada di dinding' } 
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
