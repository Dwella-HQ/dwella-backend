import { IsUUID } from 'class-validator';

export class CreateRentPaymentDto {
  @IsUUID()
  rentId: string;
}
