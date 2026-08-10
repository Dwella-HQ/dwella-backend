import { File } from 'src/file/entities/file.entity';
import { PropertyManager } from 'src/property-manager/entities/property-manager.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
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
import { LandlordSettings } from './landlord-settings.entity';
import { Property } from 'src/property/entities/property.entity';
import {
  Address,
  ApprovalStatusEnum,
  LandlordTypeEnum,
} from 'src/utils/constants';
import { LandlordKYB } from './landlord-kyb.entity';

@Entity()
export class Landlord extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.landlord, { eager: true })
  user!: Relation<User>;

  @Column({ nullable: true, type: 'json' })
  address?: Address;

  @Column({ unique: true, nullable: true })
  name!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true, eager: true })
  profilePicture!: Relation<File>;

  @OneToOne(() => LandlordKYB, (kyb) => kyb.landlord, { cascade: true })
  kyb!: Relation<LandlordKYB>;

  @Column({ type: 'text', default: LandlordTypeEnum.PERSONAL })
  landlordType!: LandlordTypeEnum;

  // documents ----

  @OneToMany(
    () => PropertyManager,
    (propertyManager) => propertyManager.landlord,
  )
  propertyManagers!: Relation<PropertyManager[]>;

  @JoinColumn()
  @OneToOne(() => LandlordSettings, (settings) => settings.landlord)
  settings!: Relation<LandlordSettings>;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isApproved!: boolean;

  @Column({ nullable: true, type: 'text' })
  approvalStatus!: ApprovalStatusEnum;

  @OneToMany(() => Property, (property) => property.landlord)
  properties!: Relation<Property[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
