import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ default: 15 })
  duration: number; //minutes

  @Column({
    type: 'enum',
    enum: ['scheduled', 'completed', 'cancelled', 'missed'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'completed' | 'canceled' | 'missed';

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ nullable: true })
  reason: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  attended: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { eager: true })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments, { eager: true })
  patient: Patient;
}
