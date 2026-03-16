import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Property } from 'src/property/entities/property.entity';
import { Unit } from 'src/property/entities/units.entity';
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

@Entity()
export class Announcement extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Landlord)
  landlord: Relation<Landlord>;

  @ManyToOne(() => Property)
  property: Relation<Property>;

  @ManyToOne(() => Unit)
  unit: Relation<Unit>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
