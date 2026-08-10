import { File } from 'src/file/entities/file.entity';
import { Property } from 'src/property/entities/property.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import {
  MaintenanceRequestLevel,
  MaintenanceRequestPriority,
  MaintenanceRequestStatus,
} from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { MaintenanceRequestSubType } from '../maintenance-request-types/entities/maintenance-request-subtypes.entity';
import { MaintenanceRequestType } from '../maintenance-request-types/entities/maintenance-request-type.entity';

@Entity()
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => Property, { nullable: false })
  property: Relation<Property>;

  @ManyToOne(() => Unit)
  unit: Relation<Unit>;

  @ManyToOne(() => Tenant)
  tenant: Relation<Tenant>;

  @Column('text', { default: MaintenanceRequestLevel.UNIT })
  level: MaintenanceRequestLevel;

  @ManyToOne(() => MaintenanceRequestType, { eager: true })
  type: Relation<MaintenanceRequestType>;

  @ManyToOne(() => MaintenanceRequestSubType, { eager: true, nullable: true })
  subType: Relation<MaintenanceRequestSubType>;

  @Column()
  description: string;

  @Column('text')
  priority: MaintenanceRequestPriority;

  @Column('text', { default: MaintenanceRequestStatus.IN_PROGRESS })
  status: MaintenanceRequestStatus;

  @OneToMany(() => File, (file) => file.maintenanceRequest, { cascade: true })
  supportingFiles: Relation<File>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
