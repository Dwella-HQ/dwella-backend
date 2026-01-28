import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentProviderEnum, TransferUserDetails } from 'src/utils/constants';

export class CreateDebitTransactionDto {
  @IsEnum(PaymentProviderEnum)
  provider: PaymentProviderEnum;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  @IsOptional()
  narration: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TransferUserDetails)
  receiverDetails: TransferUserDetails;
}

export class CreateCreditTransactionDto {
  @IsEnum(PaymentProviderEnum)
  provider: PaymentProviderEnum;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  @IsOptional()
  narration: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TransferUserDetails)
  senderDetails: TransferUserDetails;
}
