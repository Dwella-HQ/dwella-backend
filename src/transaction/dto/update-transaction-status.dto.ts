import { IsEnum, IsOptional } from 'class-validator';
import { TransactionStatusEnum } from 'src/utils/constants';

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatusEnum)
  transactionStatus: TransactionStatusEnum;

  @IsOptional()
  metaData?: Record<string, any>;
}
