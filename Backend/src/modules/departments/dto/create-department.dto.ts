import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'HSE', description: 'Nama departemen' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'HSE', description: 'Kode unik departemen (max 30 karakter)', maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;
}

export class UpsertDepartmentsDto {
  @ApiProperty({
    type: [CreateDepartmentDto],
    description: 'Array departemen yang akan di-upsert (insert or update by code)',
  })
  departments: CreateDepartmentDto[];
}
