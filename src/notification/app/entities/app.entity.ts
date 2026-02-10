import { User } from 'src/user/entities/user.entity';
import { NotificationTypeEnum } from 'src/utils/constants';
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
export class AppNotification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: Relation<User>;

  @Column({
    type: 'text',
  })
  type: NotificationTypeEnum;

  @Column()
  action: string;

  @Column({ default: false })
  popup: boolean;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
