import { Module } from '@nestjs/common';
import { EmergencyDrillService } from './emergency-drill.service';
import { EmergencyDrillController } from './emergency-drill.controller';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

@Module({
  controllers: [EmergencyDrillController],
  providers: [EmergencyDrillService, SupabaseStorageService],
  exports: [EmergencyDrillService],
})
export class EmergencyDrillModule {}
