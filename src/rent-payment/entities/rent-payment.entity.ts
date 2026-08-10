import { Rent } from 'src/rent/entity/rent.entity';
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
export class RentPayment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  lateFee: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  totalAmount: number;

  @Column({
    type: 'text',
  })
  currency: CurrenciesEnum;

  @Column({
    type: 'text',
    nullable: true,
  })
  paymentMethod: PaymentMethodEnum;

  @Column({ default: '' })
  narration: string;

  @JoinColumn()
  @OneToOne(() => Transaction, { nullable: true })
  transaction: Relation<Transaction>;

  @ManyToOne(() => Wallet)
  wallet: Relation<Wallet>;

  @Index()
  @Column({ unique: true })
  indempotencyKey: string;

  @JoinColumn({ name: 'walletTransactionId' })
  @OneToOne(() => WalletTransaction)
  walletTransaction: Relation<WalletTransaction>;

  @Index()
  @Column({ nullable: true })
  walletTransactionId: string;

  @Index()
  @Column()
  reference: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  senderDetails: TransferUserDetails;

  @Column({ type: 'text', default: TransactionStatusEnum.PENDING })
  status: TransactionStatusEnum;

  @ManyToOne(() => Rent, (rent) => rent.payments)
  @JoinColumn()
  rent: Relation<Rent>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
