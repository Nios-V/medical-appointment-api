import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get('available')
  findAvailable(@Query('at') at: string) {
    const date = new Date(at);

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (date.getTime() < new Date().getTime()) {
      throw new BadRequestException('Invalid date: Past date');
    }

    return this.doctorsService.findAvailableAt(date);
  }

  @Get('speciality/:speciality')
  findBySpeciality(@Param('speciality') speciality: string) {
    if (!speciality) {
      throw new BadRequestException('Speciality is required');
    }

    return this.doctorsService.findBySpeciality(speciality);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
