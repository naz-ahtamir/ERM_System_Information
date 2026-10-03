import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ 
    description: 'Nama lengkap', 
    example: 'Budi Santoso' 
  })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiPropertyOptional({ 
    description: 'Jabatan', 
    example: 'Staff HSE' 
  })
  @IsOptional()
  @IsString()
  jabatan?: string;

  @ApiPropertyOptional({ 
    description: 'Departemen', 
    example: 'HSE' 
  })
  @IsOptional()
  @IsString()
  departemen?: string;

  @ApiPropertyOptional({ 
    description: 'Divisi', 
    example: 'Production' 
  })
  @IsOptional()
  @IsString()
  divisi?: string;

  @ApiPropertyOptional({ 
    description: 'Pusat', 
    example: 'Jakarta' 
  })
  @IsOptional()
  @IsString()
  pusat?: string;

  @ApiPropertyOptional({ 
    description: 'Perusahaan', 
    example: 'QMB' 
  })
  @IsOptional()
  @IsString()
  perusahaan?: string;

  @ApiPropertyOptional({ 
    description: 'Email', 
    example: 'budi.santoso@qmb.co.id' 
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'UUID Pusat (FK ke Center)' })
  @IsOptional()
  @IsString()
  centerId?: string | null;

  @ApiPropertyOptional({ description: 'UUID Departemen (FK ke Department)' })
  @IsOptional()
  @IsString()
  departmentId?: string | null;

  @ApiPropertyOptional({ description: 'UUID Divisi (FK ke Division)' })
  @IsOptional()
  @IsString()
  divisionId?: string | null;
}

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Password saat ini', 
    example: 'oldpassword123' 
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({ 
    description: 'Password baru (min 6 karakter)', 
    example: 'newpassword456' 
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: 'ID karyawan', 
    example: 'EMP-001' 
  })
  @IsString()
  idKaryawan: string;

  @ApiPropertyOptional({ 
    description: 'Email', 
    example: 'budi.santoso@qmb.co.id' 
  })
  @IsOptional()
  @IsString()
  email?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Token reset password', 
    example: 'abc123token' 
  })
  @IsString()
  token: string;

  @ApiProperty({ 
    description: 'Password baru (min 6 karakter)', 
    example: 'newpassword789' 
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
