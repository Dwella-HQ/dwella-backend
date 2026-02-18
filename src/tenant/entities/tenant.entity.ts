import { User } from 'src/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Lease } from './lease.entity';
import { Unit } from 'src/property/entities/units.entity';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.tenant)
  user: Relation<User>;

  @OneToMany(() => Lease, (lease) => lease.tenant)
  leases: Relation<Lease>[];

  @OneToOne(() => Unit, (unit) => unit.tenant)
  currentUnit: Relation<Unit>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
