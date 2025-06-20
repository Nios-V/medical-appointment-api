import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DeleteResult, Repository } from 'typeorm';
import moment from 'moment';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const newDoctor = this.doctorRepository.create(createDoctorDto);
    return await this.doctorRepository.save(newDoctor);
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorRepository.find();
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException(`Doctor not found with ID ${id}`);
    return doctor;
  }

  async findAvailableAt(scheduledAt: Date): Promise<Doctor[]> {
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoin(
        'doctor.appointments',
        'appointment',
        `appointment.status = 'scheduled' AND appointment.scheduledAt >= :start AND appointment.scheduledAt <= :end`,
        { start, end },
      )
      .where('appointment.id IS NULL')
      .getMany();
  }

  async isAvailableAt(doctorId: string, scheduledAt: Date): Promise<boolean> {
    const start = moment(scheduledAt);
    const end = moment(scheduledAt).add(30, 'minutes');
    const count = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoin(
        'doctor.appointments',
        'appointment',
        'doctorId = :doctorId AND appointment.status = :status AND appointment.scheduledAt >= :start AND appointment.scheduledAt < :end',
        {
          doctorId,
          status: 'scheduled',
          start: start.toDate(),
          end: end.toDate(),
        },
      );
    return (await count.getCount()) === 0;
  }

  async findBySpeciality(speciality: string): Promise<Doctor[]> {
    return this.doctorRepository.find({ where: { speciality } });
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor)
      throw new NotFoundException(`Doctor not found with ID ${id} for update`);

    const updated = await this.doctorRepository.merge(doctor, updateDoctorDto);
    return this.doctorRepository.save(updated);
  }

  async remove(id: string): Promise<DeleteResult> {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor)
      throw new NotFoundException(`Doctor not found with ID ${id} for delete`);
    return this.doctorRepository.softDelete(id);
  }
}
