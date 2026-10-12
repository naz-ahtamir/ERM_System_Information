import { Module } from '@nestjs/common';
import { PicaController } from './pica.controller';
import { PicaService } from './pica.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../../storage/storage.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [PrismaModule, StorageModule, NotificationsModule],
  controllers: [PicaController],
  providers: [PicaService],
  exports: [PicaService],
})
export class PicaModule {}
