import { IsString, IsOptional, IsIn } from 'class-validator';

export class ActionPicaDto {
  @IsString()
  id: string;

  @IsString()
  @IsIn(['submit_perbaikan', 'approve', 'reject', 'set_in_progress'])
  action: string;

  @IsOptional()
  @IsString()
  keterangan?: string;

  @IsOptional()
  @IsString()
  oleh?: string;
}
