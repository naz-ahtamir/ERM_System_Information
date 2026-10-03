// src/modules/k3-policy/dto/update-k3-policy.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateK3PolicyDto } from './create-k3-policy.dto';

export class UpdateK3PolicyDto extends PartialType(CreateK3PolicyDto) {
  @ApiPropertyOptional({ description: 'ID kebijakan yang akan diupdate', example: 'KP-001' })
  id?: string;
}
