import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';

export type StorageBucket =
  | 'findings'
  | 'documents'
  | 'k3-policy'
  | 'objek-k3'
  | 'induction'
  | 'investigation'
  | 'emergency-drill'
  | 'smk3';

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
   * Upload a file buffer to Supabase Storage.
   * Returns the permanent public URL.
   *
   * @param buffer     - file buffer (from multer memoryStorage)
   * @param originalname - original filename (used to get extension)
   * @param mimetype   - MIME type of the file
   * @param folder     - storage sub-folder (e.g. 'findings', 'k3-policy')
   */
  async upload(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    folder: StorageBucket | string,
  ): Promise<string> {
    const ext      = extname(originalname).toLowerCase();
    const unique   = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${unique}${ext}`;
    const path     = `${folder}/${filename}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType: mimetype,
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
