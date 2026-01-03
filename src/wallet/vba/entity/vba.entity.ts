import { Exclude, instanceToPlain } from 'class-transformer';
import { CurrenciesEnum, PaymentProviderEnum } from 'src/utils/constants';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class VBA extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.vbas, { nullable: false })
  wallet: Wallet;

  @Column({
    type: 'string',
  })
  provider: PaymentProviderEnum;

  @Column()
  accountName: string;

  @Column()
  accountNumber: string;

  @Column()
  bankName: string;

  @Column()
  bankCode: string;

  @Column({
    type: 'string',
    default: CurrenciesEnum.NGN,
  })
  currency: CurrenciesEnum;

  @Exclude()
  @Column('simple-json')
  metadata: Record<string, any>;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
