import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnitPricingDto } from 'src/utils/shared.dto';

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
  @Type(() => UnitPricingDto)
  @IsOptional()
  pricing?: UnitPricingDto[];
}
