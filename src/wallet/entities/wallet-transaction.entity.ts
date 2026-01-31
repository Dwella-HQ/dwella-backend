import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import {
  TransactionActionEnum,
  TransactionTypeEnum,
} from 'src/utils/constants';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { ColumnNumericTransformer } from 'src/utils/misc';

@Entity()
export class WalletTransaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  postBalance: number;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  preBalance: number;

  @Index()
  @Column({ unique: true })
  reference: string;

  @Column({
    type: 'enum',
    enum: TransactionTypeEnum,
  })
  type: TransactionTypeEnum;

  @Column({
    type: 'text',
  })
  action: TransactionActionEnum;

  @Column({ default: '' })
  description: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: false })
  wallet: Relation<Wallet>;

  @JoinColumn()
  @OneToOne(() => Transaction, (transaction) => transaction.walletTransaction)
  transaction: Relation<Transaction>;

  @Column({ nullable: true, type: 'simple-json' })
  metaData: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
