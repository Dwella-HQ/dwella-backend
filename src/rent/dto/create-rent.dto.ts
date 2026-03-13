import { IsDate, IsUUID } from 'class-validator';

export class CreateRentDto {
  @IsUUID()
  leaseId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsDate()
  dueDate: Date;
}
