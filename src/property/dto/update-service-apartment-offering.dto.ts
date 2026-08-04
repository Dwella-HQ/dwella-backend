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

export class UpdateServiceApartmentOfferingDto {
  @IsNumber()
  @IsOptional()
  minimumStay?: number;

  @IsNumber()
  @IsOptional()
  maximumStay?: number;

  @IsString()
  @IsOptional()
  clockoutTime?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  @IsOptional()
  pricing?: PricingDto[];

  @IsString()
  @IsOptional()
  rules?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
