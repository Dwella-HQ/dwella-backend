import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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

export class UpdateRentOfferingDto {
  @IsNumber()
  @IsOptional()
  gracePeriod?: number;

  @IsNumber()
  @IsOptional()
  securityDeposit?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  @IsOptional()
  pricing?: PricingDto[];
}
