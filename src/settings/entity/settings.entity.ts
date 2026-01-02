import { CurrenciesEnum, PaymentProviderEnum } from 'src/utils/constants';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Settings extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'string',
    default: CurrenciesEnum.NGN,
  })
  defaultCurrency: CurrenciesEnum;

  @Column({
    type: 'string',
    default: PaymentProviderEnum.PAYSTACK,
  })
  preferredPaymentProvider: PaymentProviderEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
