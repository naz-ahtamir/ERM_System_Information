import { Module } from '@nestjs/common';
import { DeadlineSchedulerService } from './deadline-scheduler.service';
import { DeadlineSchedulerController } from './deadline-scheduler.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [DeadlineSchedulerService],
  controllers: [DeadlineSchedulerController],
  exports: [DeadlineSchedulerService],
})
export class DeadlineSchedulerModule {}
