import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDepositDto {
  @IsUUID()
  walletId: string;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  @IsOptional()
  narration?: string;
}
