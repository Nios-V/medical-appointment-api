import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import moment from 'moment';
import { DoctorsService } from 'src/doctors/doctors.service';
import { PatientsService } from 'src/patients/patients.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
  ) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    const scheduledAt = moment(createAppointmentDto.scheduledAt);

    if (!scheduledAt.isValid()) {
      throw new BadRequestException('Invalid date format for scheduledAt');
    }

    if (scheduledAt.day() === 0 || scheduledAt.day() === 6) {
      throw new BadRequestException(
        'Appointments cannot be scheduled on weekends',
      );
    }

    if (scheduledAt.hour() < 8 || scheduledAt.hour() > 18) {
      throw new BadRequestException(
        'Appointments must be scheduled between 8 AM and 6 PM',
      );
    }

    const isDoctorAvailable = this.doctorsService.isAvailableAt(
      createAppointmentDto.doctorId,
      createAppointmentDto.scheduledAt,
    );
    if (!isDoctorAvailable) {
      throw new BadRequestException(
        'Doctor is not available at the requested time',
      );
    }

    const isPatientAvailable = this.patientsService.isAvailableAt(
      createAppointmentDto.patientId,
      createAppointmentDto.scheduledAt,
    );
    if (!isPatientAvailable) {
      throw new BadRequestException(
        'Patient is not available at the requested time',
      );
    }

    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentsService.cancel(id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentsService.confirm(id);
  }

  @Patch(':id/attend')
  attend(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentsService.attend(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
