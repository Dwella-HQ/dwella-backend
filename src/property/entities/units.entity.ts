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
import { ColumnNumericTransformer } from 'src/utils/misc';
import { Lease } from 'src/tenant/entities/lease.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';

@Entity()
export class Unit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.units, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  property: Relation<Property>;

  @Column()
  name: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  rentAmount: number;

  @Column()
  numberOfBedrooms: number;

  @Column()
  numberOfBathrooms: number;

  @Column({
    default: true,
  })
  isAvailable: boolean;

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  @OneToMany(() => Lease, (lease) => lease.unit)
  leases: Relation<Lease>[];

  @JoinColumn()
  @OneToOne(() => Tenant, (tenant) => tenant.currentUnit)
  tenant: Relation<Tenant>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
