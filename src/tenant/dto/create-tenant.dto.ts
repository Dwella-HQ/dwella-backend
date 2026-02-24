import { IsDateString, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import {
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';

export class CreateTenantDto {
  @IsUUID('all')
  userId: string;

  @IsUUID('all')
  unitId: string;

  @IsDateString()
  leaseStartDate: Date;

  @IsDateString()
  leaseEndDate: Date;

  @IsEnum(RentFrequencyEnum)
  rentFrequency: RentFrequencyEnum;

  @IsNumber()
  @Min(0)
  rentAmount: number;

  @IsNumber()
  @Min(0)
  securityDeposit: number;

  @IsEnum(ServiceChargeFrequencyEnum)
  securityDepositFrequency: ServiceChargeFrequencyEnum;

  @IsUUID('all')
  leaseDocumentId: string;
}
