import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import {
  VerificationStatusEnum,
  VerificationTypeEnum,
} from 'src/utils/constants';

export class QueryVerificationDto {
  @IsEnum(VerificationTypeEnum)
  @IsOptional()
  type?: VerificationTypeEnum;

  @IsEnum(VerificationStatusEnum)
  @IsOptional()
  status?: VerificationStatusEnum;

  @IsUUID()
  @IsOptional()
  verifiedById?: string;

  @IsUUID()
  @IsOptional()
  landlordId?: string;

  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsDateString()
  @IsOptional()
  maxDateVerifiedAt?: Date;

  @IsDateString()
  @IsOptional()
  minDateVerifiedAt?: Date;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
