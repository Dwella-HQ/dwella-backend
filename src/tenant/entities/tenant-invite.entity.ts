import { File } from 'src/file/entities/file.entity';
import { Unit } from 'src/property/entities/units.entity';
import {
  INVITE_STATUS,
  NextOfKinDetails,
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @ManyToOne(() => File, { nullable: true })
  document: Relation<File>;

  @Column({ type: 'text', default: INVITE_STATUS.PENDING })
  status: INVITE_STATUS;

  @Column()
  idType: string;

  @Column()
  idNumber: string;

  @JoinColumn()
  @OneToOne(() => File)
  idDocument: Relation<File>;

  @Column()
  isEmployed: boolean;

  @Column({ nullable: true })
  employerName: string;

  @Column({ nullable: true })
  employerContact: string;

  @Column('json', { nullable: true })
  nextOfKinDetails: NextOfKinDetails;

  @Column({ nullable: true, unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
