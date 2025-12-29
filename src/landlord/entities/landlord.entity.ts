import { File } from 'src/file/entities/file.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Landlord extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.landlord, { eager: true })
  user: Relation<User>;

  @Column()
  landLordName: string;

  // documents ----
  @OneToOne(() => File, { nullable: true, eager: true })
  govermentIdDocument: Relation<File>;

  @OneToOne(() => File, { nullable: true, eager: true })
  landSurveyDocument: Relation<File>;

  @OneToOne(() => File, { nullable: true, eager: true })
  proofOfOwnershipDocument: Relation<File>;

  @OneToOne(() => File, { nullable: true, eager: true })
  taxIdentificationNumberDocument: Relation<File>;

  @ManyToOne(() => User, { nullable: true, eager: true })
  approvedBy: Relation<User>;

  @Column({ nullable: true })
  approvedDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
