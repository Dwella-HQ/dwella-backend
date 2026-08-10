import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnitPricingDto } from 'src/utils/shared.dto';

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
  @Type(() => UnitPricingDto)
  @IsOptional()
  pricing?: UnitPricingDto[];

  @IsString()
  @IsOptional()
  rules?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
