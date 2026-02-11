import { INVITE_STATUS, PERMISSIONS } from 'src/utils/constants';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { PropertyManager } from './property-manager.entity';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Property } from 'src/property/entities/property.entity';

@Entity()
export class PropertyManagerInvite extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column('text', { default: INVITE_STATUS.PENDING })
  status: INVITE_STATUS;

  @Column({ nullable: true, unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => PropertyManager)
  propertyManager: Relation<PropertyManager>;

  @ManyToOne(() => Landlord)
  landlord: Relation<Landlord>;

  @JoinTable()
  @ManyToMany(() => Property)
  properties: Relation<Property[]>;

  @Column({ type: 'simple-array', default: [] })
  permissions: PERMISSIONS[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
