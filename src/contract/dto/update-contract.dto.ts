import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import {
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';

/**
 * Mutable contract fields only — `type`/`unit`/party (tenant or guest) are
 * structural and not editable after creation.
 */
export class UpdateContractDto {
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rentAmount?: number;

  @IsEnum(RentFrequencyEnum)
  @IsOptional()
  rentFrequency?: RentFrequencyEnum;

  @IsNumber()
  @Min(0)
  @IsOptional()
  nightlyRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  securityDeposit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  serviceCharge?: number;

  @IsEnum(ServiceChargeFrequencyEnum)
  @IsOptional()
  serviceChargeFrequency?: ServiceChargeFrequencyEnum;

  @IsUUID('all')
  @IsOptional()
  documentId?: string;
}
