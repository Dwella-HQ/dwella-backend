import { IsDateString, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import {
  RentFrequencyEnum,
  SecurityDepositFrequencyEnum,
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

  @IsEnum(SecurityDepositFrequencyEnum)
  securityDepositFrequency: SecurityDepositFrequencyEnum;

  @IsUUID('all')
  leaseDocumentId: string;
}
