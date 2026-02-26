import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Lease } from './lease.entity';
import { Unit } from 'src/property/entities/units.entity';
import { File } from 'src/file/entities/file.entity';
import { NextOfKinDetails } from 'src/utils/shared.dto';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.tenant)
  user: Relation<User>;

  @OneToMany(() => Lease, (lease) => lease.tenant)
  leases: Relation<Lease>[];

  @OneToOne(() => Unit, (unit) => unit.tenant)
  currentUnit: Relation<Unit>;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
