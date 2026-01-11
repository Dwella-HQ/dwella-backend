import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class QueryPropertyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  landlordId?: string;

  @IsOptional()
  @IsNumber()
  minYearBuilt?: number;

  @IsOptional()
  @IsNumber()
  maxYearBuilt?: number;

  @IsOptional()
  @IsBoolean()
  parkingSpace?: boolean;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
