import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import { PERMISSIONS } from 'src/utils/constants';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PropertyManager extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @ManyToOne(() => User, (user) => user.propertyManager)
  user: Relation<User>;

  @ManyToOne(() => Landlord, (landlord) => landlord.propertyManagers, {
    nullable: false,
  })
  landlord: Relation<Landlord>;

  @JoinTable()
  @ManyToMany(() => Property, (property) => property.propertyManagers)
  properties: Relation<Property[]>;

  @Column({ type: 'simple-array', default: [] })
  permissions: PERMISSIONS[];

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
