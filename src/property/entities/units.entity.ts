import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';

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

  @Column('decimal', { precision: 10, scale: 2 })
  rentAmount: number;

  @Column()
  numberOfBedrooms: number;

  @Column()
  numberOfBathrooms: number;

  @Column({
    default: true,
  })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
