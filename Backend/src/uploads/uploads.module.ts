import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, SupabaseStorageService],
})
export class UploadsModule {}
