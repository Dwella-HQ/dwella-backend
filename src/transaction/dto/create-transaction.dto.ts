import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CurrenciesEnum,
  TransactionActionEnum,
  TransferUserDetails,
} from 'src/utils/constants';

export class CreateDebitTransactionDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsEnum(TransactionActionEnum)
  action: TransactionActionEnum;

  @IsEnum(CurrenciesEnum)
  currency: CurrenciesEnum;

  @IsString()
  @IsOptional()
  narration?: string;
}

export class CreateCreditTransactionDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsEnum(TransactionActionEnum)
  action: TransactionActionEnum;

  @IsEnum(CurrenciesEnum)
  currency: CurrenciesEnum;

  @Type(() => TransferUserDetails)
  @ValidateNested()
  senderDetails: TransferUserDetails;

  @IsUUID()
  walletId: string;

  @IsString()
  @IsOptional()
  narration?: string;
}
