import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import {
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';
import { Unit } from 'src/property/entities/unit.entity';
import { File } from 'src/file/entities/file.entity';
import { Rent } from 'src/rent/entity/rent.entity';
import { ColumnNumericTransformer } from 'src/utils/misc';

@Entity()
export class Lease {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.leases, { nullable: false })
  tenant?: Relation<Tenant>;

  @ManyToOne(() => Unit, (unit) => unit.leases, { nullable: false })
  unit?: Relation<Unit>;

  @Column()
  startDate!: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  rentAmount!: number;

  @Column({ type: 'text' })
  rentFrequency!: RentFrequencyEnum;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  securityDeposit!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  serviceCharge!: number;

  @Column({ type: 'text' })
  serviceChargeFrequency!: ServiceChargeFrequencyEnum;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Rent, (rent) => rent.lease)
  rents?: Relation<Rent>[];

  @OneToOne(() => File, { nullable: true })
  document?: Relation<File>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
