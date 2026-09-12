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
import { Contract } from 'src/contract/entities/contract.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { File } from 'src/file/entities/file.entity';
import { NextOfKinDetails } from 'src/utils/shared.dto';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.tenant, { eager: true })
  user: Relation<User>;

  @OneToMany(() => Contract, (contract) => contract.tenant)
  contracts: Relation<Contract>[];

  @OneToOne(() => Unit, (unit) => unit.tenant, { nullable: false })
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
