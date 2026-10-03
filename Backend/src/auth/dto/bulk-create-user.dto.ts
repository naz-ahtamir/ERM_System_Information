import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkCreateUserDto {
  @ApiProperty({ 
    description: 'ID karyawan', 
    example: 'EMP-001' 
  })
  idKaryawan: string;

  @ApiProperty({ 
    description: 'Nama lengkap', 
    example: 'Budi Santoso' 
  })
  name: string;

  @ApiProperty({ 
    description: 'Email', 
    example: 'budi.santoso@qmb.co.id' 
  })
  email: string;

  @ApiPropertyOptional({ 
    description: 'Departemen', 
    example: 'HSE' 
  })
  department?: string;

  @ApiPropertyOptional({ 
    description: 'Jabatan', 
    example: 'Staff HSE' 
  })
  jabatan?: string;
}

export class BulkCreateUsersRequestDto {
  @ApiProperty({ 
    description: 'Array users yang akan dibuat', 
    type: [BulkCreateUserDto] 
  })
  users: BulkCreateUserDto[];
}
