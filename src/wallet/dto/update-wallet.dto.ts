import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TransactionActionEnum } from 'src/utils/constants';

// export class UpdateWalletDto extends PartialType(CreateWalletDto) {}

export class CreditWalletDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsUUID()
  reference: string;

  @IsEnum(TransactionActionEnum)
  action: TransactionActionEnum;

  @IsString()
  @IsOptional()
  narration?: string;
}

export class DebitWalletDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsUUID()
  reference: string;

  @IsEnum(TransactionActionEnum)
  action: TransactionActionEnum;

  @IsString()
  @IsOptional()
  narration?: string;
}
