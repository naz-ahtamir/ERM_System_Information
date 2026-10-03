import { PartialType } from '@nestjs/mapped-types';
import { CreatePicaDto } from './create-pica.dto';

export class UpdatePicaDto extends PartialType(CreatePicaDto) {}
