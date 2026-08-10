import { Transaction } from 'src/transaction/entities/transaction.entity';
import {
  CurrenciesEnum,
  PaymentMethodEnum,
  TransactionStatusEnum,
} from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';
import { TransferUserDetails } from 'src/utils/shared.dto';
import { WalletTransaction } from 'src/wallet/entities/wallet-transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
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

@Entity()
export class Deposit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount!: number;

  @Column({
    type: 'text',
  })
  currency!: CurrenciesEnum;

  @Column({ default: '' })
  narration!: string;

  @JoinColumn()
  @OneToOne(() => Transaction, { nullable: true })
  transaction!: Relation<Transaction>;

  @ManyToOne(() => Wallet)
  wallet!: Relation<Wallet>;

  @JoinColumn({ name: 'walletTransactionId' })
  @OneToOne(() => WalletTransaction)
  walletTransaction!: Relation<WalletTransaction>;

  @Index()
  @Column({ nullable: true, unique: true })
  walletTransactionId?: string;

  @Index()
  @Column()
  reference!: string;

  @Index()
  // TODO - remove nullable
  @Column({ nullable: true, unique: true })
  indempotencyKey?: string;

  @Column('text', {
    default: TransactionStatusEnum.PENDING,
  })
  status!: TransactionStatusEnum;

  @Column('json', { nullable: true })
  senderDetails?: TransferUserDetails;

  @Column('text', { nullable: true })
  paymentMethod?: PaymentMethodEnum;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
