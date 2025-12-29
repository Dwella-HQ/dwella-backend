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
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { RegistrationTypeEnum } from 'src/utils/constants';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Address } from 'src/address/entities/address.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ type: 'text', default: RegistrationTypeEnum.EMAIL })
  registrationType: RegistrationTypeEnum;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Relation<Role>;

  @OneToOne(() => Landlord, (landlord) => landlord.user)
  landlord: Relation<Landlord>;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Relation<Address>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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
