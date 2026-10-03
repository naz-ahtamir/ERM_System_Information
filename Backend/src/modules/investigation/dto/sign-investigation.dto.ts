import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SignApprovalDto {
  @ApiPropertyOptional({ description: 'URL / base64 tanda tangan digital atasan HSE' })
  @IsString()
  @IsOptional()
  signatureApproval?: string;
}

export class SignVictimDto {
  @ApiPropertyOptional({ description: 'URL / base64 tanda tangan korban' })
  @IsString()
  @IsOptional()
  victimSignature?: string;
}

export class SignSupervisorDto {
  @ApiPropertyOptional({ description: 'URL / base64 tanda tangan atasan korban' })
  @IsString()
  @IsOptional()
  supervisorSignature?: string;

  @ApiPropertyOptional({ description: 'Catatan dari atasan korban' })
  @IsString()
  @IsOptional()
  supervisorNote?: string;
}
