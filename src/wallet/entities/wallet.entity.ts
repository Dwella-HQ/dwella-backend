import { Landlord } from 'src/landlord/entities/landlord.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { CurrenciesEnum } from 'src/utils/constants';
import { VBA } from '../vba/entity/vba.entity';
import { Exclude, instanceToPlain } from 'class-transformer';
import { WalletTransaction } from './wallet-transaction.entity';
import { ColumnNumericTransformer } from 'src/utils/misc';
import { TransferUserDetails } from 'src/utils/shared.dto';

@Entity()
@Index(['landlord', 'currency'], { unique: true })
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    default: CurrenciesEnum.NGN,
  })
  currency!: CurrenciesEnum;

  @ManyToOne(() => Landlord)
  landlord!: Relation<Landlord>;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  balance!: number;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  escrowBalance!: number;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions!: Relation<WalletTransaction[]>;

  @OneToMany(() => VBA, (vba) => vba.wallet)
  vbas?: Relation<VBA[]>;

  @Column({ nullable: true })
  bvn!: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  metadata!: Record<string, any>;

  @Column({
    type: 'simple-json',
    default: {},
  })
  withdrawalDetails!: TransferUserDetails;

  vba?: VBA;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
