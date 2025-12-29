import { File } from 'src/file/entities/file.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
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
  @Column({ nullable: true })
  govermentIdDocument: Relation<File>;

  @Column({ nullable: true })
  landSurveyDocument: Relation<File>;

  @Column({ nullable: true })
  proofOfOwnershipDocument: Relation<File>;

  @Column({ nullable: true })
  taxIdentificationNumberDocument: Relation<File>;
  // --- documents

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
