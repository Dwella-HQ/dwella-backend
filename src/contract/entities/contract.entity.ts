import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Guest } from './guest.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { File } from 'src/file/entities/file.entity';
import { Rent } from 'src/rent/entity/rent.entity';
import {
  ContractStatusEnum,
  ContractTypeEnum,
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';

/**
 * A tenancy agreement over a `Unit`. Two flavours share one flat table
 * (mirrors `Unit.serviceApartmentOffering`/`Unit.rentOffering`'s existing
 * parallel-nullable-relation idiom, rather than STI/table-per-subtype):
 *
 * - LEASE: a `tenant` occupies the unit for a fixed term at a periodic rent
 *   (`rentAmount`/`rentFrequency`, e.g. MONTHLY).
 * - SHORTLET: a `guest` books the unit for a check-in/check-out date range.
 *   `nightlyRate` is the quoting basis; `rentAmount` holds the total stay
 *   cost (billed once — `rentFrequency` is always ONE_TIME).
 *
 * Exactly one of `tenant`/`guest` is set, matching `type` — enforced at the
 * service layer, not via a DB constraint (consistent with the rest of this
 * schema).
 */
@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  type!: ContractTypeEnum;

  @Column({ type: 'text', default: ContractStatusEnum.DRAFT })
  status!: ContractStatusEnum;

  @ManyToOne(() => Unit, (unit) => unit.contracts, { nullable: false })
  unit?: Relation<Unit>;

  @ManyToOne(() => Tenant, (tenant) => tenant.contracts, { nullable: true })
  tenant?: Relation<Tenant>;

  @ManyToOne(() => Guest, (guest) => guest.contracts, { nullable: true })
  guest?: Relation<Guest>;

  /** Lease term start / shortlet check-in date. */
  @Column()
  startDate!: Date;

  /** Lease term end (nullable = open-ended lease) / shortlet check-out date (required for SHORTLET). */
  @Column({ nullable: true })
  endDate?: Date;

  /** Periodic rent (LEASE) or total stay cost (SHORTLET). Read by `Rent` generation regardless of type. */
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  rentAmount?: number;

  @Column({ type: 'text', nullable: true })
  rentFrequency?: RentFrequencyEnum;

  /** SHORTLET-only per-night quoting/display rate. */
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  nightlyRate?: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  securityDeposit?: number;

  /** Also used as a shortlet cleaning fee, paired with `serviceChargeFrequency: ONE_TIME`. */
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  serviceCharge?: number;

  @Column({ type: 'text', nullable: true })
  serviceChargeFrequency?: ServiceChargeFrequencyEnum;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true })
  document?: Relation<File>;

  @OneToMany(() => Rent, (rent) => rent.contract)
  rents?: Relation<Rent>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
