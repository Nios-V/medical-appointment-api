import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentsService } from 'src/appointments/appointments.service';

@Injectable()
export class CronSyncMissedAppointmentsService {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: 'Sinchronize missed appointments',
    timeZone: 'America/Santiago',
  })
  async cronSyncMissed() {
    const tag = 'CronSyncMissedAppointmentsService - ';
    try {
      const missed = await this.appointmentsService.findMissed();
      if (missed.length) {
        for (const appointment of missed) {
          console.log(tag + `procesando appointment: ${appointment.id}`);
          const updatedAppointment = {
            ...appointment,
            status: 'missed',
            attended: false,
          };
          await this.appointmentsService.update(
            appointment.id,
            updatedAppointment,
          );
          console.log(
            tag + `appointment ${appointment.id} updated with status 'missed'`,
          );
        }
      } else {
        console.log(tag + 'No missed appointments to process');
      }
    } catch (error) {
      console.error(tag + 'Error processing missed appointments: ', error);
    }
  }
}
