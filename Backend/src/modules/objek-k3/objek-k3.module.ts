import { Module } from '@nestjs/common';
import { ObjekK3Service } from './objek-k3.service';
import { ObjekK3Controller } from './objek-k3.controller';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

@Module({
  controllers: [ObjekK3Controller],
  providers: [ObjekK3Service, SupabaseStorageService],
  exports: [ObjekK3Service],
})
export class ObjekK3Module {}
