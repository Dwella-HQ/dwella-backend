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

export class CreateServiceApartmentOfferingDto {
  @IsUUID()
  @IsNotEmpty()
  unitId!: string;

  @IsNumber()
  @IsOptional()
  minimumStay?: number;

  @IsNumber()
  @IsOptional()
  maximumStay?: number;

  @IsString()
  @IsNotEmpty()
  clockoutTime!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  @IsOptional()
  pricing?: PricingDto[];

  @IsString()
  @IsNotEmpty()
  rules!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
