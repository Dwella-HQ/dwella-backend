import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { TransferUserDetails } from 'src/utils/constants';

export class CreateDebitTransactionDto {
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
  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  @IsOptional()
  narration?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TransferUserDetails)
  senderDetails: TransferUserDetails;
}
