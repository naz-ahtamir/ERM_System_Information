import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ 
    description: 'ID user penerima notifikasi', 
    example: 'uuid-user-123' 
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: 'Tipe notifikasi', 
    enum: [
      'finding_submitted',
      'approval_required',
      'finding_approved',
      'finding_rejected',
      'deadline_reminder',
      'license_expiring_soon',
      'license_expired',
    ],
    example: 'finding_submitted' 
  })
  @IsEnum([
    'finding_submitted',
    'approval_required',
    'finding_approved',
    'finding_rejected',
    'deadline_reminder',
    'license_expiring_soon',
    'license_expired',
  ])
  @IsNotEmpty()
  type:
    | 'finding_submitted'
    | 'approval_required'
    | 'finding_approved'
    | 'finding_rejected'
    | 'deadline_reminder'
    | 'license_expiring_soon'
    | 'license_expired';

  @ApiProperty({ 
    description: 'Judul notifikasi', 
    example: 'Temuan Baru Dibuat' 
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Isi pesan notifikasi', 
    example: 'Ada temuan baru yang perlu ditinjau' 
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ 
    description: 'ID temuan terkait (opsional)', 
    example: 'uuid-finding-123' 
  })
  @IsUUID()
  @IsOptional()
  findingId?: string;

  @ApiPropertyOptional({ 
    description: 'ID ObjekK3 terkait (opsional)', 
    example: 'cuid-objek-k3-123' 
  })
  @IsString()
  @IsOptional()
  objekK3Id?: string;

  @ApiPropertyOptional({ 
    description: 'Status notifikasi (sudah dibaca/belum)', 
    example: false 
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
