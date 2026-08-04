import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PricingDto {
  @IsString()
  @IsNotEmpty()
  mode!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;
}

export class CreateRentOfferingDto {
  @IsUUID()
  @IsNotEmpty()
  unitId!: string;

  @IsNumber()
  @IsNotEmpty()
  gracePeriod!: number;

  @IsNumber()
  @IsNotEmpty()
  securityDeposit!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  @IsOptional()
  pricing?: PricingDto[];
}
