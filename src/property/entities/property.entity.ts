import { Address } from 'src/address/entities/address.entity';
import { File } from 'src/file/entities/file.entity';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import {
  BaseEntity,
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
import { Unit } from './units.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Property extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Landlord)
  landlord: Relation<Landlord>;

  @Column()
  name: string;

  @OneToOne(() => Address, { eager: true })
  address: Relation<Address>;

  @Column({
    default: false,
  })
  isApproved: boolean;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: Relation<User>;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({ nullable: true })
  propertyType: string;

  @Column()
  yearBuilt: number;

  @Column({ default: 0 })
  numberOfUnits: number;

  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  parkingSpace: boolean;

  @OneToMany(() => File, (file) => file.propertyPhoto, {
    eager: true,
    cascade: true,
  })
  photos: Relation<File[]>;

  @OneToMany(() => File, (file) => file.propertyDocument, {
    eager: true,
    cascade: true,
  })
  documents: Relation<File[]>;

  @OneToMany(() => Unit, (units) => units.property, {
    eager: true,
    cascade: true,
  })
  units: Relation<Unit[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
