import { File } from 'src/file/entities/file.entity';
import { Unit } from 'src/property/entities/units.entity';
import {
  INVITE_STATUS,
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TenantInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @ManyToOne(() => Unit, { nullable: false })
  unit: Relation<Unit>;

  @Column()
  leaseStartDate: Date;

  @Column()
  leaseEndDate: Date;

  @Column({ type: 'text' })
  rentFrequency: RentFrequencyEnum;

  @Column('decimal', { precision: 10, scale: 2 })
  rentAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  securityDeposit: number;

  @Column({ type: 'text' })
  securityDepositFrequency: ServiceChargeFrequencyEnum;

  @ManyToOne(() => File, { nullable: true })
  document: Relation<File>;

  @Column({ type: 'text', default: INVITE_STATUS.PENDING })
  status: INVITE_STATUS;

  @Column({ nullable: true, unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
