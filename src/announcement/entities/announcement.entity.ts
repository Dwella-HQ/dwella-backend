import { File } from 'src/file/entities/file.entity';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Property } from 'src/property/entities/property.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { AnnounementLevelEnum } from 'src/utils/constants';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Announcement extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column({ type: 'text' })
  level!: AnnounementLevelEnum;

  @ManyToOne(() => Landlord, { nullable: false })
  landlord!: Relation<Landlord>;

  @JoinTable()
  @ManyToMany(() => Property)
  properties?: Relation<Property>[];

  @OneToMany(() => File, (file) => file.announcement, { eager: true })
  files?: Relation<File[]>;

  @JoinTable()
  @ManyToMany(() => Unit)
  units?: Relation<Unit>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
