import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CurrenciesEnum, LanguagesEnum } from 'src/utils/constants';

export class UpdateLandlordPlatformPreferencesDto {
  @IsEnum(CurrenciesEnum)
  @IsOptional()
  defaultCurrency?: CurrenciesEnum;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultLateFeeAmount?: number;

  @IsEnum(LanguagesEnum)
  @IsOptional()
  language?: LanguagesEnum;
}
