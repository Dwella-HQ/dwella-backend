import { Transaction } from 'src/transaction/entities/transaction.entity';
import { CurrenciesEnum, TransactionStatusEnum } from 'src/utils/constants';
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
export class Withdrawal extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: 'text',
  })
  currency: CurrenciesEnum;

  @Column({ default: '' })
  narration: string;

  @JoinColumn()
  @OneToOne(() => Transaction, { nullable: true })
  transaction: Relation<Transaction>;

  @ManyToOne(() => Wallet)
  wallet: Relation<Wallet>;

  @JoinColumn()
  @OneToOne(() => WalletTransaction)
  walletTransaction: Relation<WalletTransaction>;

  @Index()
  @Column()
  reference: string;

  @Column('text', {
    default: TransactionStatusEnum.PENDING,
  })
  status: TransactionStatusEnum;

  @Column('json', { nullable: true })
  recipientDetails: TransferUserDetails;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
