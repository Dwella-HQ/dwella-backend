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
export class RentOffering {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  gracePeriod!: number;

  @Column()
  securityDeposit!: number;

  @Column({ type: 'json', nullable: true })
  pricing?: {
    mode: string;
    price: number;
  }[];

  @OneToOne(() => Unit, (unit) => unit.rentOffering, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  unit!: Relation<Unit>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
