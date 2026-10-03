import { Module } from '@nestjs/common';
import { LicenseSchedulerService } from './license-scheduler.service';
import { LicenseSchedulerController } from './license-scheduler.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [LicenseSchedulerService],
  controllers: [LicenseSchedulerController],
  exports: [LicenseSchedulerService],
})
export class LicenseSchedulerModule {}
