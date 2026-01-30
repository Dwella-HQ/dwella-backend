import { IsArray, IsEnum, IsOptional } from 'class-validator';
import {
  CurrenciesEnum,
  PaymentMethodEnum,
  PaymentProviderEnum,
} from 'src/utils/constants';

export class UpdateSettingsDto {
  @IsEnum(CurrenciesEnum)
  @IsOptional()
  defaultCurrency?: CurrenciesEnum;

  @IsEnum(PaymentProviderEnum)
  @IsOptional()
  preferredPaymentProvider?: PaymentProviderEnum;

  @IsEnum(PaymentMethodEnum, { each: true })
  @IsArray()
  @IsOptional()
  paymentMethods?: PaymentMethodEnum[];
}
