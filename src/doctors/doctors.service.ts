import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DeleteResult, Repository } from 'typeorm';

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
