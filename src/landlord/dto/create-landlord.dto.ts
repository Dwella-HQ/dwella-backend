import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BankAccountDto, CreateAddressDto } from 'src/utils/shared.dto';

export class CreateLandlordDto {
  @IsUUID('all')
  userId!: string;
}
