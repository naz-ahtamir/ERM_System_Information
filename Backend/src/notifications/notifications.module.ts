import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SeedNotificationsController } from './seed-notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // provides JwtModule + JwtAuthGuard with correct secret from ConfigService
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController, SeedNotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
