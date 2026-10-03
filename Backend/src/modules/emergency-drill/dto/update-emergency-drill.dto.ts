import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateEmergencyDrillDto } from './create-emergency-drill.dto';

export class UpdateEmergencyDrillDto extends PartialType(CreateEmergencyDrillDto) {
  @ApiPropertyOptional({ description: 'ID data yang akan diupdate', example: 'ED-001' })
  id?: string;
}
