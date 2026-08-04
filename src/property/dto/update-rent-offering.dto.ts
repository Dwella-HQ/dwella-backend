import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UnitPricingDto } from 'src/utils/shared.dto';

export class UpdateRentOfferingDto {
  @IsNumber()
  @IsOptional()
  gracePeriod?: number;

  @IsNumber()
  @IsOptional()
  securityDeposit?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitPricingDto)
  @IsOptional()
  pricing?: UnitPricingDto[];
}
