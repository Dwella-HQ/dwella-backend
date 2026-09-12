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
import { User } from 'src/user/entities/user.entity';
import { File } from 'src/file/entities/file.entity';
import { IdTypeEnum } from 'src/utils/constants';
import { Contract } from './contract.entity';

/**
 * A shortlet booker. Deliberately lighter than `Tenant` — no employment or
 * next-of-kin details, and no required `User` link, since a landlord/PM can
 * record a booking on a guest's behalf without the guest ever signing up.
 */
@Entity()
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  idType?: IdTypeEnum;

  @Column({ nullable: true })
  idNumber?: string;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true })
  idDocument?: Relation<File>;

  /** Forward-compatible hook for a future guest self-service portal; unused for now. */
  @JoinColumn()
  @OneToOne(() => User, { nullable: true })
  user?: Relation<User>;

  @OneToMany(() => Contract, (contract) => contract.guest)
  contracts?: Relation<Contract>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
