import { Test, TestingModule } from '@nestjs/testing';
import { CronSyncMissedAppointmentsService } from './cron-sync-missed-appointments.service';

describe('CronSyncMissedAppointmentsService', () => {
  let service: CronSyncMissedAppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronSyncMissedAppointmentsService],
    }).compile();

    service = module.get<CronSyncMissedAppointmentsService>(
      CronSyncMissedAppointmentsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
