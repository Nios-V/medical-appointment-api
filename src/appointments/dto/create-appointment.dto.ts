import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsDateString()
  scheduledAt: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(15)
  @Max(60)
  duration: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @IsNotEmpty()
  @IsString()
  patientId: string;
}
