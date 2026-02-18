import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { ColumnNumericTransformer } from 'src/utils/misc';
import { Lease } from 'src/tenant/entities/lease.entity';

@Entity()
export class Unit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.units, {
    nullable: false,
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
