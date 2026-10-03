import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { K3PolicyController } from './k3-policy.controller';
import { K3PolicyService } from './k3-policy.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

@Module({
  imports: [JwtModule],
  controllers: [K3PolicyController],
  providers: [K3PolicyService, PrismaService, SupabaseStorageService],
  exports: [K3PolicyService],
})
export class K3PolicyModule {}