import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ContractStatusEnum, ContractTypeEnum } from 'src/utils/constants';

export class QueryContractDto {
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsUUID()
  @IsOptional()
  guestId?: string;

  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID()
  @IsOptional()
  contractId?: string;

  @IsEnum(ContractTypeEnum)
  @IsOptional()
  type?: ContractTypeEnum;

  @IsEnum(ContractStatusEnum)
  @IsOptional()
  status?: ContractStatusEnum;

  /** Back-compat with `queryLease`'s call shape — maps to `status === ACTIVE`. */
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
