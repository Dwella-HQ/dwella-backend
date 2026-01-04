import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentProviderEnum } from 'src/utils/constants';

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

  @IsOptional()
  metadata: Record<string, any>;

  @IsEnum(PaymentProviderEnum)
  provider: PaymentProviderEnum;
}
