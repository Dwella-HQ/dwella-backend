import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { LateFeeTypeEnum } from 'src/utils/constants';

export class UpdateLandlordLateFeeDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  lateFeeAmount!: number;

  @IsEnum(LateFeeTypeEnum)
  @IsOptional()
  lateFeeType!: LateFeeTypeEnum;
}
