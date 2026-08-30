import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['security', 'property'])
export class SecurityProperty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  security!: Relation<User>;

  @ManyToOne(() => Property, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  property!: Relation<Property>;

  @CreateDateColumn()
  createdAt!: Date;
}
