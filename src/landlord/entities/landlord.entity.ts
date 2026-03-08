import { Address } from 'src/address/entities/address.entity';
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

@Entity()
export class Landlord extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.landlord, { eager: true })
  user: Relation<User>;

  @OneToOne(() => Address, { eager: true })
  @JoinColumn()
  address: Relation<Address>;

  @Column()
  landLordName: string;

  @Column({ default: '' })
  landLordEmail: string;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true, eager: true })
  profilePicture: Relation<File>;

  // documents ----
  @JoinColumn()
  @OneToOne(() => File, { nullable: true, eager: true })
  govermentIdDocument: Relation<File>;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true, eager: true })
  landSurveyDocument: Relation<File>;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true, eager: true })
  proofOfOwnershipDocument: Relation<File>;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true, eager: true })
  taxIdentificationNumberDocument: Relation<File>;

  @OneToMany(
    () => PropertyManager,
    (propertyManager) => propertyManager.landlord,
  )
  propertyManagers: Relation<PropertyManager[]>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
