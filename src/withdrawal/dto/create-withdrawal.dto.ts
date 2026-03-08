import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { TransferUserDetails } from 'src/utils/shared.dto';

export class CreateWithdrawalDto {
  @IsUUID()
  walletId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  narration?: string;

  @Type(() => TransferUserDetails)
  @ValidateNested()
  recipientDetails: TransferUserDetails;
}
