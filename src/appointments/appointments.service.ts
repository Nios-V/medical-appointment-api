import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const newAppointment =
      this.appointmentRepository.create(createAppointmentDto);
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
