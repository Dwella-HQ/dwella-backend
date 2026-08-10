import { Unit } from 'src/property/entities/unit.entity';
import {
  INVITE_STATUS,
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';
import { NextOfKinDetails } from 'src/utils/shared.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TenantInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  fullName: string;

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

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  rentAmount: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  securityDeposit: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  serviceCharge: number;

  @Column({ type: 'text' })
  serviceChargeFrequency: ServiceChargeFrequencyEnum;

  @Column('text')
  documentId: string;

  @Column({ type: 'text', default: INVITE_STATUS.PENDING })
  status: INVITE_STATUS;

  @Column()
  idType: string;

  @Column()
  idNumber: string;

  @Column('text')
  idDocumentId: string;

  @Column()
  isEmployed: boolean;

  @Column({ nullable: true })
  employerName: string;

  @Column({ nullable: true })
  employerContact: string;

  @Column('json', { nullable: true })
  nextOfKinDetails: NextOfKinDetails;

  @Index()
  @Column({ unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
