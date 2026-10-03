import { Module } from '@nestjs/common';
import { InvestigationService } from './investigation.service';
import { InvestigationController } from './investigation.controller';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

@Module({
  controllers: [InvestigationController],
  providers: [InvestigationService, SupabaseStorageService],
  exports: [InvestigationService],
})
export class InvestigationModule {}
