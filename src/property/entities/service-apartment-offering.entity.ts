import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Unit } from './unit.entity';

@Entity()
export class ServiceApartmentOffering {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  minimumStay?: number;

  @Column({ nullable: true })
  maximumStay?: number;

  @Column()
  clockoutTime!: string;

  @Column({ type: 'json', nullable: true })
  pricing?: {
    mode: string;
    price: number;
  }[];

  @Column()
  rules!: string;

  @Column()
  description!: string;

  @OneToOne(() => Unit, (unit) => unit.serviceApartmentOffering, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  unit!: Relation<Unit>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
