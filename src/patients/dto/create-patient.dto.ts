import { IsBoolean, IsDate, IsString } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsDate()
  birthDate: Date;

  @IsBoolean()
  active: boolean;
}
