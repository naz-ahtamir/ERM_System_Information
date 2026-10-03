import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FindingsModule } from './findings/findings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { K3PolicyModule } from './modules/k3-policy/k3-policy.module';
import { CentersModule } from './modules/centers/centers.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DivisionsModule } from './modules/divisions/divisions.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DeadlineSchedulerModule } from './scheduler/deadline-scheduler.module';
import { LicenseSchedulerModule } from './scheduler/license-scheduler.module';
import { ObjekK3SchedulerModule } from './scheduler/objek-k3-scheduler.module';
import { InductionModule } from './modules/induction/induction.module';
import { ObjekK3Module } from './modules/objek-k3/objek-k3.module';
import { EmergencyDrillModule } from './modules/emergency-drill/emergency-drill.module';
import { InvestigationModule } from './modules/investigation/investigation.module';
import { PicaSchedulerModule } from './scheduler/pica-scheduler.module';
import { PicaModule } from './modules/pica/pica.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    StorageModule,
    PrismaModule,
    AuthModule,
    FindingsModule,
    NotificationsModule,
    UploadsModule,
    K3PolicyModule,
    CentersModule,
    DepartmentsModule,
    DivisionsModule,
    DocumentsModule,
    DeadlineSchedulerModule,
    LicenseSchedulerModule,
    ObjekK3SchedulerModule,
    InductionModule,
    ObjekK3Module,
    EmergencyDrillModule,
    InvestigationModule,
    PicaModule,
    PicaSchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
