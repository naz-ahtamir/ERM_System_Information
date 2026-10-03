import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCenterDto {
  @ApiProperty({ example: 'PUSAT MANAJEMEN TANGGAP DARURAT' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'PMT-01' })
  @IsString()
  @MaxLength(30)
  code: string;
}

export class UpdateCenterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;
}
