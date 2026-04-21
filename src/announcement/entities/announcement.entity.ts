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
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Announcement extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Landlord)
  landlord: Relation<Landlord>;

  @ManyToOne(() => Property)
  property: Relation<Property>;

  @OneToMany(() => File, (file) => file.announcement, { eager: true })
  files: Relation<File[]>;

  @ManyToOne(() => Unit)
  unit: Relation<Unit>;

  @Column({
    type: 'text',
    default: AnnounementLevelEnum.PROPERTY,
  })
  level: AnnounementLevelEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
