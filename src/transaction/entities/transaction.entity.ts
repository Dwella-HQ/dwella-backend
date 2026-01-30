import {
  CurrenciesEnum,
  PaymentMethodEnum,
  PaymentProviderEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
  TransferUserDetails,
} from 'src/utils/constants';
import { WalletTransaction } from 'src/wallet/entities/wallet-transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  provider: PaymentProviderEnum;

  @Column({
    type: 'text',
  })
  currency: CurrenciesEnum;

  @Column({
    type: 'text',
    nullable: true,
  })
  paymentMethod: PaymentMethodEnum;

  @ManyToOne(() => Wallet, { nullable: false })
  wallet: Relation<Wallet>;

  @OneToOne(() => WalletTransaction, (transaction) => transaction.wallet)
  walletTransaction: Relation<WalletTransaction>;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ default: '' })
  narration: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  senderDetails: TransferUserDetails;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  receiverDetails: TransferUserDetails;

  @Column({
    type: 'text',
  })
  transactionType: TransactionTypeEnum;

  @Column({
    type: 'text',
    default: TransactionStatusEnum.PENDING,
  })
  transactionStatus: TransactionStatusEnum;

  @Column({ nullable: true })
  paymentUrl?: string;

  @Column({ nullable: true, type: 'simple-json' })
  metaData?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
