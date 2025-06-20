import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { DeleteResult, LessThan, Repository } from 'typeorm';
import { DoctorsService } from 'src/doctors/doctors.service';
import { PatientsService } from 'src/patients/patients.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { doctorId, patientId, ...appointmentDetails } = createAppointmentDto;
    const doctor = await this.doctorsService.findOne(doctorId);
    if (!doctor) throw new NotFoundException(`Doctor Id ${doctorId} not found`);

    const patient = await this.patientsService.findOne(patientId);
    if (!patient)
      throw new NotFoundException(`Patient Id ${doctorId} not found`);

    const newAppointment = this.appointmentRepository.create({
      ...appointmentDetails,
      doctor: doctor,
      patient: patient,
    });
    return await this.appointmentRepository.save(newAppointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });
    if (!appointment)
      throw new NotFoundException(`Appointment not found with ID ${id}`);
    return appointment;
  }

  async findMissed(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: {
        scheduledAt: LessThan(new Date()),
        attended: false,
        status: 'scheduled',
      },
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment)
      throw new NotFoundException(
        `Appointment not found with ID ${id} for Update`,
      );

    const updated = this.appointmentRepository.merge(
      appointment,
      updateAppointmentDto,
    );
    return await this.appointmentRepository.save(updated);
  }

  async confirm(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment)
      throw new NotFoundException(
        `Appointment with ID ${id} not found to confirm`,
      );

    appointment.isConfirmed = true;

    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status === 'completed')
      throw new BadRequestException('Cannot cancel a completed appointment');

    appointment.status = 'canceled';

    return this.appointmentRepository.save(appointment);
  }

  async attend(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment)
      throw new NotFoundException(
        `Appointment with ID ${id} not found to attend`,
      );

    if (appointment.status === 'canceled')
      throw new BadRequestException('Cannot attend a canceled appointment');

    if (appointment.status === 'completed')
      throw new BadRequestException('Cannot attend a completed appointment');

    const updated = this.appointmentRepository.merge(appointment, {
      attended: true,
      status: 'completed',
    });

    return this.appointmentRepository.save(updated);
  }

  async remove(id: string): Promise<DeleteResult> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment)
      throw new NotFoundException(
        `Appointment not found with ID ${id} for delete`,
      );

    return await this.appointmentRepository.softDelete(id);
  }
}
