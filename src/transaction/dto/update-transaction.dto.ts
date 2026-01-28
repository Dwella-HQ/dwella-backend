import { PartialType } from '@nestjs/swagger';
import {
  CreateCreditTransactionDto,
  CreateDebitTransactionDto,
} from './create-transaction.dto';

export class UpdateCreditTransactionDto extends PartialType(
  CreateCreditTransactionDto,
) {}
export class UpdateDebitTransactionDto extends PartialType(
  CreateDebitTransactionDto,
) {}
