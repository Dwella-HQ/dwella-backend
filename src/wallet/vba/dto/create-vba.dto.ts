import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CurrenciesEnum, PaymentProviderEnum } from 'src/utils/constants';

export class CreateVBADto {
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsEnum(CurrenciesEnum)
  currency: CurrenciesEnum;

  @IsOptional()
  metadata: Record<string, any>;

  @IsUUID('all')
  walletId: string;

  @IsEnum(PaymentProviderEnum)
  provider: PaymentProviderEnum;
}
