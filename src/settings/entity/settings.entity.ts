import {
  CurrenciesEnum,
  PaymentMethodEnum,
  PaymentProviderEnum,
} from 'src/utils/constants';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Settings extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'text',
    default: CurrenciesEnum.NGN,
  })
  defaultCurrency: CurrenciesEnum;

  @Column({
    type: 'text',
    default: PaymentProviderEnum.FLUTTERWAVE,
  })
  preferredPaymentProvider: PaymentProviderEnum;

  @Column({
    type: 'simple-json',
    default: [PaymentMethodEnum.CARD, PaymentMethodEnum.BANK_TRANSFER],
  })
  paymentMethods: PaymentMethodEnum[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
