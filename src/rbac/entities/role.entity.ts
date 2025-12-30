import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Exclude, instanceToPlain } from 'class-transformer';
import { USER_ROLES } from 'src/utils/constants';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, type: 'varchar', length: 255, nullable: true })
  name: USER_ROLES;

  @Column({ nullable: true })
  description: string;

  @Exclude()
  @JoinTable()
  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Relation<Permission>[];

  @OneToMany(() => User, (user) => user.role)
  users: Relation<User>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
