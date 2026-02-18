import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import {
  RentFrequencyEnum,
  SecurityDepositFrequencyEnum,
} from 'src/utils/constants';
import { Unit } from 'src/property/entities/units.entity';

@Entity()
export class Lease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.leases)
  tenant: Relation<Tenant>;

  @ManyToOne(() => Unit, (unit) => unit.leases)
  unit: Relation<Unit>;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  rentAmount: number;

  @Column({ type: 'text' })
  rentFrequency: RentFrequencyEnum;

  @Column('decimal', { precision: 10, scale: 2 })
  securityDeposit: number;

  @Column({ type: 'text' })
  securityDepositFrequency: SecurityDepositFrequencyEnum;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => File, { nullable: true })
  document: Relation<File>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
