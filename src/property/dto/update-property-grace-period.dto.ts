import { IsEnum, IsOptional } from 'class-validator';
import {
  MonthlyRentGracePeriodEnum,
  QuarterlyRentGracePeriodEnum,
  YearlyRentGracePeriodEnum,
} from 'src/utils/constants';

export class UpdatePropertyGracePeriodDto {
  @IsEnum(MonthlyRentGracePeriodEnum)
  @IsOptional()
  monthlyRentGracePeriod?: MonthlyRentGracePeriodEnum;

  @IsEnum(QuarterlyRentGracePeriodEnum)
  @IsOptional()
  quarterlyRentGracePeriod?: QuarterlyRentGracePeriodEnum;

  @IsEnum(YearlyRentGracePeriodEnum)
  @IsOptional()
  yearlyRentGracePeriod?: YearlyRentGracePeriodEnum;
}
