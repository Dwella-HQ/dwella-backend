import { IsEnum } from 'class-validator';
import { CurrenciesEnum, PaymentProviderEnum } from 'src/utils/constants';

export class UpdateSettingsDto {
  @IsEnum(CurrenciesEnum)
  defaultCurrency?: CurrenciesEnum;

  @IsEnum(PaymentProviderEnum)
  prefferedPaymentMethod?: PaymentProviderEnum;
}
