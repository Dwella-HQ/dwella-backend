import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  IdTypeEnum,
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';
import { NextOfKinDetails } from 'src/utils/shared.dto';

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

  @IsNumber()
  @Min(0)
  serviceCharge: number;

  @IsEnum(ServiceChargeFrequencyEnum)
  serviceChargeFrequency: ServiceChargeFrequencyEnum;

  @IsUUID('all')
  leaseDocumentId: string;

  @IsEnum(IdTypeEnum)
  idType: IdTypeEnum;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @IsUUID('all')
  idDocumentId: string;

  @IsBoolean()
  isEmployed: boolean;

  @IsString()
  @IsNotEmpty()
  employerName: string;

  @IsString()
  @IsNotEmpty()
  employerContact: string;

  @Type(() => NextOfKinDetails)
  @ValidateNested()
  nextOfKinDetails: NextOfKinDetails;
}
