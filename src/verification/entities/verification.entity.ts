import { File } from 'src/file/entities/file.entity';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import {
  VerificationStatusEnum,
  VerificationTypeEnum,
} from 'src/utils/constants';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Verification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  type: VerificationTypeEnum;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({
    type: 'varchar',
    default: VerificationStatusEnum.PENDING,
  })
  status: VerificationStatusEnum;

  @Column({ nullable: true })
  reason: string;

  @ManyToOne(() => User)
  verifiedBy: Relation<User>;

  @JoinColumn()
  @OneToOne(() => Landlord, { nullable: true })
  landlord: Relation<Landlord>;

  @JoinColumn()
  @OneToOne(() => Property, { nullable: true })
  property: Relation<Property>;

  @OneToMany(() => File, (file) => file.verification, {
    eager: true,
    cascade: true,
  })
  supportingDocuments: Relation<File[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
