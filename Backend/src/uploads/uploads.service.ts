import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

export interface UploadResult {
  filePath: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@Injectable()
export class UploadsService {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  constructor(private readonly storageService: SupabaseStorageService) {}

  async uploadFile(
    file: MulterFile,
    subElementId: string,
  ): Promise<UploadResult> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed types: jpg, jpeg, png');
    }

    // Tidak ada batasan ukuran file

    const publicUrl = await this.storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      `smk3/${subElementId}`,
    );

    return {
      filePath: publicUrl,
      filename: publicUrl.split('/').pop() ?? file.originalname,
      size:     file.size,
      mimetype: file.mimetype,
    };
  }
}
