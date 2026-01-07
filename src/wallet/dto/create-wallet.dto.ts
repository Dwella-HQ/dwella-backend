import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsUUID,
  Length,
} from 'class-validator';
import { CurrenciesEnum } from 'src/utils/constants';

export class CreateLandlordWalletDto {
  @IsUUID()
  landlordId: string;

  @IsNumberString()
  @Length(11, 11)
  bvn: string;

  @IsEnum(CurrenciesEnum)
  @IsOptional()
  currency: CurrenciesEnum;
}

export class CreateAgentWalletDto {
  @IsUUID()
  agentId: string;

  @IsNumberString()
  @Length(11, 11)
  bvn: string;

  @IsEnum(CurrenciesEnum)
  @IsOptional()
  currency: CurrenciesEnum;
}

export class CreateTenantWalletDto {
  @IsUUID()
  tenantId: string;

  @IsNumberString()
  @Length(11, 11)
  bvn: string;

  @IsEnum(CurrenciesEnum)
  @IsOptional()
  currency: CurrenciesEnum;
}
