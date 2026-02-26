import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
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

export class InviteTenantDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsUUID('all')
  unitId: string;

  @IsDate()
  leaseStartDate: Date;

  @IsDate()
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
