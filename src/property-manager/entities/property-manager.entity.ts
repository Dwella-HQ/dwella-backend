import { Address } from 'src/address/entities/address.entity';
import { File } from 'src/file/entities/file.entity';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PropertyManager extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.propertyManager)
  user: Relation<User>;

  @OneToOne(() => Address, { eager: true })
  @JoinColumn()
  address: Relation<Address>;

  @JoinColumn()
  @OneToOne(() => File, { nullable: true, eager: true })
  profilePicture: Relation<File>;

  @JoinTable()
  @ManyToMany(() => Landlord, (landlord) => landlord.propertyManagers)
  landlords: Relation<Landlord[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
