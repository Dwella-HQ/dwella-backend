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

export class CreateLeaseContractDto {
  @IsUUID('all')
  tenantId!: string;

  @IsUUID('all')
  unitId!: string;

  @IsDateString()
  startDate!: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsEnum(RentFrequencyEnum)
  rentFrequency!: RentFrequencyEnum;

  @IsNumber()
  @Min(0)
  rentAmount!: number;

  @IsNumber()
  @Min(0)
  securityDeposit!: number;

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
