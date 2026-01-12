import { Exclude, instanceToPlain } from 'class-transformer';
import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import { Verification } from 'src/verification/entities/verification.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @ManyToOne(() => User, { nullable: false })
  user: Relation<User>;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  s3Key: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  s3ETag: string;

  @Column({ nullable: true })
  url: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  s3Bucket: string;

  @Column()
  folder: string;

  @Column({
    default: false,
  })
  isPublic: boolean;

  @Column()
  size: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'timestamptz', nullable: true })
  expirationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.photos, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  propertyPhoto: Relation<Property>;

  @ManyToOne(() => Property, (property) => property.documents, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  propertyDocument: Relation<Property>;

  @ManyToOne(
    () => Verification,
    (verification) => verification.supportingDocuments,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  verification: Relation<Verification>;

  toJSON() {
    return instanceToPlain(this);
  }
}
