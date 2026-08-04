import {
  BaseEntity,
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
import { Property } from './property.entity';
// import { ColumnNumericTransformer } from 'src/utils/misc';
import { Lease } from 'src/tenant/entities/lease.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { File } from 'src/file/entities/file.entity';
import { ServiceApartmentOffering } from './service-apartment-offering.entity';
import { RentOffering } from './rent-offering.entity';

@Entity()
export class Unit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Property, (property) => property.units, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  property!: Relation<Property>;

  @Column()
  name!: string;

  @Column()
  numberOfBedrooms!: number;

  @Column()
  numberOfBathrooms!: number;

  @Column({
    default: true,
  })
  isAvailable!: boolean;

  @OneToMany(() => File, (file) => file.unit, {
    cascade: true,
    eager: true,
  })
  images?: Relation<File[]>;

  @Column({ type: 'simple-array', nullable: true })
  amenities!: string[];

  @OneToMany(() => Lease, (lease) => lease.unit)
  leases?: Relation<Lease>[];

  @JoinColumn()
  @OneToOne(() => Tenant, (tenant) => tenant.currentUnit)
  tenant?: Relation<Tenant>;

  @JoinColumn({ name: 'serviceApartmentOfferingId' })
  @OneToOne(
    () => ServiceApartmentOffering,
    (serviceApartmentOffering) => serviceApartmentOffering.unit,
    {
      nullable: true,
      cascade: true,
    },
  )
  serviceApartmentOffering?: Relation<ServiceApartmentOffering>;

  @Column({
    nullable: true,
  })
  serviceApartmentOfferingId?: string;

  @JoinColumn({ name: 'rentOfferingId' })
  @OneToOne(() => RentOffering, (rentOffering) => rentOffering.unit, {
    nullable: true,
    cascade: true,
  })
  rentOffering?: Relation<RentOffering>;

  @Column({
    nullable: true,
  })
  rentOfferingId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
