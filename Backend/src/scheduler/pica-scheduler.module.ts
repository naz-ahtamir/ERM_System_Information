import { Module } from '@nestjs/common';
import { PicaSchedulerService } from './pica-scheduler.service';
import { PicaSchedulerController } from './pica-scheduler.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PicaSchedulerService],
  controllers: [PicaSchedulerController],
  exports: [PicaSchedulerService],
})
export class PicaSchedulerModule {}
