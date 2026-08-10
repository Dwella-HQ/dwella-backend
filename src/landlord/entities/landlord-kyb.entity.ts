import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from 'src/file/entities/file.entity';
import { Relation } from 'typeorm';
import { Landlord } from './landlord.entity';
import { Address } from 'src/utils/constants';

@Entity()
export class LandlordKYB {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Landlord, (landlord) => landlord.kyb, { nullable: false })
  @JoinColumn()
  landlord!: Relation<Landlord>;

  @Column()
  businessName!: string;

  @Column()
  businessEmail!: string;

  @Column()
  businessPhoneNumber!: string;

  @Column({ nullable: true, type: 'json' })
  businessAddress!: Address;

  @OneToOne(() => File, { nullable: false, eager: true })
  @JoinColumn()
  businessLogo!: Relation<File>;

  @OneToOne(() => File, { nullable: false, eager: true })
  @JoinColumn()
  businessCACCertificate!: Relation<File>;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn()
  businessTINCertificate!: Relation<File>;

  @Column({ nullable: true })
  businessTINNumber!: string;

  @OneToOne(() => File, { nullable: true, eager: true })
  @JoinColumn()
  businessProofOfAddressDocument!: Relation<File>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
