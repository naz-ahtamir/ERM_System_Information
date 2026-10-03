import { Module } from '@nestjs/common';
import { ObjekK3SchedulerService } from './objek-k3-scheduler.service';
import { ObjekK3SchedulerController } from './objek-k3-scheduler.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ObjekK3SchedulerService],
  controllers: [ObjekK3SchedulerController],
  exports: [ObjekK3SchedulerService],
})
export class ObjekK3SchedulerModule {}
