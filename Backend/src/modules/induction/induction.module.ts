import { Module } from '@nestjs/common';
import { InductionService } from './induction.service';
import { InductionController, InductionPublicController } from './induction.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [InductionController, InductionPublicController],
  providers: [InductionService, SupabaseStorageService],
  exports: [InductionService],
})
export class InductionModule {}
