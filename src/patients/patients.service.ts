import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { DeleteResult, Repository } from 'typeorm';
import moment from 'moment';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const newPatient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(newPatient);
  }

  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient)
      throw new NotFoundException(`Patient not found with ID ${id}`);
    return patient;
  }

  async isAvailableAt(patientId: string, scheduledAt: Date): Promise<boolean> {
    const start = moment(scheduledAt);
    const end = moment(scheduledAt).add(30, 'minutes');
    const count = this.patientRepository
      .createQueryBuilder('patient')
      .leftJoin(
        'patient.appointments',
        'appointment',
        'patientId = :patientId AND appointment.status = :status AND appointment.scheduledAt >= :start AND appointment.scheduledAt < :end',
        {
          patientId,
          status: 'scheduled',
          start: start.toDate(),
          end: end.toDate(),
        },
      );
    return (await count.getCount()) === 0;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient)
      throw new NotFoundException(`Patient not found with ID ${id} for update`);

    const updated = this.patientRepository.merge(patient, updatePatientDto);
    return this.patientRepository.save(updated);
  }

  async remove(id: string): Promise<DeleteResult> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient)
      throw new NotFoundException(`Patient not found with ID ${id} for delete`);
    return await this.patientRepository.softDelete(id);
  }
}
