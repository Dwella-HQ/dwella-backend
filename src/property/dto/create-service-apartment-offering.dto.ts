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
import { UnitPricingDto } from 'src/utils/shared.dto';

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
  @Type(() => UnitPricingDto)
  @IsOptional()
  pricing?: UnitPricingDto[];

  @IsString()
  @IsNotEmpty()
  rules!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
