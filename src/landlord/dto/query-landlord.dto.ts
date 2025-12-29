import {
  IsBoolean,
  IsNumber,
  // IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class QueryLandlordDto {
  @IsUUID('all')
  @IsOptional()
  userId?: string;

  @IsUUID('all')
  @IsOptional()
  landlordId?: string;

  @IsString()
  @IsOptional()
  landLordName?: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
