import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { MaintenanceRequestSubType } from './maintenance-request-subtypes.entity';

@Entity()
export class MaintenanceRequestType extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => MaintenanceRequestSubType, (subType) => subType.type)
  subTypes: Relation<MaintenanceRequestSubType[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
