import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';
import * as sharp from 'sharp';

export type StorageBucket =
  | 'findings'
  | 'documents'
  | 'k3-policy'
  | 'objek-k3'
  | 'induction'
  | 'investigation'
  | 'emergency-drill'
  | 'smk3';

// ── Tipe MIME gambar yang akan dikompresi ────────────────────────────────────
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff',
]);

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly client: SupabaseClient;
  private readonly bucket = 'uploads'; // single public bucket, subfolders per module

  constructor(private readonly config: ConfigService) {
    const url  = this.config.get<string>('SUPABASE_URL');
    const key  = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    }

    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  /**
   * Kompresi gambar menggunakan sharp.
   * - Resize: max lebar/tinggi 1920px (tidak diperbesar jika lebih kecil)
   * - Format: JPEG quality 80 (ukuran akhir biasanya 100–400 KB)
   * - Non-gambar: dikembalikan as-is
   */
  private async compressIfImage(
    buffer: Buffer,
    mimetype: string,
  ): Promise<{ buffer: Buffer; mimetype: string; ext: string }> {
    if (!IMAGE_MIME_TYPES.has(mimetype)) {
      return { buffer, mimetype, ext: '' }; // bukan gambar, lewati
    }

    try {
      const compressed = await (sharp as any)(buffer)
        .rotate()                                      // auto-rotate berdasarkan EXIF
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();

      const originalKB  = Math.round(buffer.length / 1024);
      const compressedKB = Math.round(compressed.length / 1024);
      this.logger.log(`Compressed image: ${originalKB} KB → ${compressedKB} KB`);

      return { buffer: compressed, mimetype: 'image/jpeg', ext: '.jpg' };
    } catch (err) {
      // Jika kompresi gagal (misal format tidak didukung), upload file asli
      this.logger.warn(`Image compression failed, uploading original: ${err}`);
      return { buffer, mimetype, ext: '' };
    }
  }

  /**
   * Upload a file buffer to Supabase Storage.
   * Gambar otomatis dikompres ke JPEG max 1920px / quality 80 sebelum upload.
   * Returns the permanent public URL.
   */
  async upload(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    folder: StorageBucket | string,
  ): Promise<string> {
    // Kompresi gambar sebelum upload
    const { buffer: finalBuffer, mimetype: finalMime, ext: newExt } =
      await this.compressIfImage(buffer, mimetype);

    // Gunakan ekstensi baru (.jpg) jika gambar dikonversi, atau ekstensi asli
    const ext      = newExt || extname(originalname).toLowerCase();
    const unique   = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${unique}${ext}`;
    const path     = `${folder}/${filename}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, finalBuffer, {
        contentType: finalMime,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload failed [${path}]: ${error.message}`);
      throw new InternalServerErrorException(`File upload failed: ${error.message}`);
    }

    // Get public URL
    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(path);

    this.logger.log(`Uploaded: ${data.publicUrl}`);
    return data.publicUrl;
  }

  /**
   * Delete a file from Supabase Storage by its public URL.
   * Silently ignores if the URL is not a Supabase Storage URL.
   */
  async delete(publicUrl: string): Promise<void> {
    try {
      // Extract the path after "/object/public/<bucket>/"
      const marker = `/object/public/${this.bucket}/`;
      const idx    = publicUrl.indexOf(marker);
      if (idx === -1) return; // not a supabase URL, skip

      const path = publicUrl.slice(idx + marker.length);

      const { error } = await this.client.storage
        .from(this.bucket)
        .remove([path]);

      if (error) {
        this.logger.warn(`Supabase delete warning [${path}]: ${error.message}`);
      } else {
        this.logger.log(`Deleted: ${path}`);
      }
    } catch (err) {
      this.logger.warn(`Could not delete file from Supabase: ${publicUrl}`);
    }
  }

  /**
   * Helper: safely upload an optional Express.Multer.File (memoryStorage).
   * Returns undefined if file is not provided.
   */
  async uploadOptional(
    file: Express.Multer.File | undefined,
    folder: StorageBucket | string,
  ): Promise<string | undefined> {
    if (!file) return undefined;
    return this.upload(file.buffer, file.originalname, file.mimetype, folder);
  }
}
