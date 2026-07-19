import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { File } from 'src/file/entities/file.entity';

@Entity()
export class KYC extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.kyc)
  @JoinColumn()
  user!: Relation<User>;

  @Column({ type: 'text' })
  idType!: string;

  @Column({ nullable: true })
  idNumber!: string;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn()
  idDocument!: Relation<File>;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn()
  proofOfAddressDocument!: Relation<File>;

  @Column()
  tinNumber!: string;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn()
  tinDocument!: Relation<File>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
