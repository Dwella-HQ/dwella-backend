import { CurrenciesEnum, PaymentProviderEnum } from 'src/utils/constants';
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
