import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CurrenciesEnum } from 'src/utils/constants';

export class CreateLandlordWalletDto {
  @IsUUID()
  landlordId: string;

  @IsEnum(CurrenciesEnum)
  @IsOptional()
  currency: CurrenciesEnum;
}

export class CreateAgentWalletDto {
  @IsUUID()
  agentId: string;

  @IsEnum(CurrenciesEnum)
  @IsOptional()
  currency: CurrenciesEnum;
}

export class CreateTenantWalletDto {
  @IsUUID()
  tenantId: string;

  @IsEnum(CurrenciesEnum)
  @IsOptional()
  currency: CurrenciesEnum;
}
