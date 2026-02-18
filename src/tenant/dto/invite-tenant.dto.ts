import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  RentFrequencyEnum,
  SecurityDepositFrequencyEnum,
} from 'src/utils/constants';

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
