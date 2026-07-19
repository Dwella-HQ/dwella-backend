import { Role } from 'src/rbac/entities/role.entity';
import { isBcryptHash } from 'src/utils/misc';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import bcrypt from 'bcrypt';
import { Exclude, instanceToPlain } from 'class-transformer';
import { Address, RegistrationTypeEnum } from 'src/utils/constants';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { PropertyManager } from 'src/property-manager/entities/property-manager.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { KYC } from './kyc.entity';
import { File } from 'src/file/entities/file.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ unique: true })
  email!: string;

  @Column({ type: 'text', default: RegistrationTypeEnum.EMAIL })
  registrationType!: RegistrationTypeEnum;

  @Exclude()
  @Column()
  password!: string;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn()
  profilePicture!: Relation<File>;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  forceChangePassword!: boolean;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role!: Relation<Role>;

  @OneToOne(() => KYC, (kyc) => kyc.user, { cascade: true })
  kyc!: Relation<KYC>;

  @OneToOne(() => Landlord, (landlord) => landlord.user)
  landlord!: Relation<Landlord>;

  @OneToOne(() => PropertyManager, (propertyManager) => propertyManager.user)
  propertyManager!: Relation<PropertyManager>;

  @OneToOne(() => Tenant, (tenant) => tenant.user)
  tenant!: Relation<Tenant>;

  @Column({ nullable: true, type: 'json' })
  address!: Address;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      if (!isBcryptHash(this.password)) {
        this.password = await bcrypt.hash(this.password, 3); // You can adjust the salt rounds as needed
      }
    }
  }

  async comparePasswords(password: string) {
    const result = await bcrypt.compare(password, this.password);
    return result;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
