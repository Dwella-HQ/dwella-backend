import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsUUID()
  walletId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  narration?: string;
}
