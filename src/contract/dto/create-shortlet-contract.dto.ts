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
import { IdTypeEnum } from 'src/utils/constants';

export class CreateShortletContractDto {
  @IsString()
  @IsNotEmpty()
  guestFullName!: string;

  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @IsPhoneNumber()
  @IsOptional()
  guestPhoneNumber?: string;

  @IsEnum(IdTypeEnum)
  @IsOptional()
  guestIdType?: IdTypeEnum;

  @IsString()
  @IsOptional()
  guestIdNumber?: string;

  @IsUUID('all')
  @IsOptional()
  guestIdDocumentId?: string;

  @IsUUID('all')
  unitId!: string;

  @IsDateString()
  checkInDate!: Date;

  @IsDateString()
  checkOutDate!: Date;

  @IsNumber()
  @Min(0)
  nightlyRate!: number;

  /** Optional override for the total stay cost (e.g. a discount) — defaults to `nightlyRate * nights` when omitted. */
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  securityDeposit?: number;

  /** Maps to `serviceCharge` + `ServiceChargeFrequencyEnum.ONE_TIME`. */
  @IsNumber()
  @Min(0)
  @IsOptional()
  cleaningFee?: number;

  @IsUUID('all')
  @IsOptional()
  documentId?: string;
}
