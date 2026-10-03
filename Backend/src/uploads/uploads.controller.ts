import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService, UploadResult } from './uploads.service';
import type { MulterFile } from './uploads.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('api/uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Upload file ke sub-element tertentu' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'subElementId'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'File yang diunggah' },
        subElementId: { type: 'string', description: 'ID sub-element tujuan upload' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File berhasil diunggah' })
  @ApiResponse({ status: 400, description: 'File atau subElementId tidak diberikan' })
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body('subElementId') subElementId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!subElementId) {
      throw new BadRequestException('subElementId is required');
    }

    return this.uploadsService.uploadFile(file, subElementId);
  }
}
