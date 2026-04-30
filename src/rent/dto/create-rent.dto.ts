import { IsDate, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateRentDto {
  @IsUUID()
  leaseId!: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}
