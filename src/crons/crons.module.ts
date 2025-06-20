import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentsModule } from '../appointments/appointments.module';
import { CronSyncMissedAppointmentsService } from './cron-sync-missed-appointments/cron-sync-missed-appointments.service';

@Module({
  imports: [ScheduleModule, AppointmentsModule],
  providers: [CronSyncMissedAppointmentsService],
})
export class CronsModule {}
