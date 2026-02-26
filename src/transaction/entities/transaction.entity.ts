import {
  CurrenciesEnum,
  PaymentMethodEnum,
  PaymentProviderEnum,
  TransactionActionEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
  TransferUserDetails,
} from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { VBA } from 'src/wallet/vba/entity/vba.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet)
  wallet: Relation<Wallet>;

  @Column({
    type: 'text',
  })
  provider: PaymentProviderEnum;

  @Column({
    type: 'text',
    default: '',
  })
  action: TransactionActionEnum;

  @Column({
    type: 'text',
  })
  currency: CurrenciesEnum;

  @Column({
    type: 'text',
    nullable: true,
  })
  paymentMethod: PaymentMethodEnum;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
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
    default: '',
  })
  type: TransactionTypeEnum;

  @Column({
    type: 'text',
    default: TransactionStatusEnum.PENDING,
  })
  status: TransactionStatusEnum;

  @ManyToOne(() => VBA, (vba) => vba.transactions, { nullable: true })
  vba?: Relation<VBA>;

  @Column({ nullable: true })
  paymentUrl?: string;

  @Column({ nullable: true, type: 'simple-json' })
  metaData?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
