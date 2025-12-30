import {
  IsBooleanString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class QueryUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID('all')
  @IsOptional()
  userId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsBooleanString()
  @IsOptional()
  isActive?: string;

  @IsBooleanString()
  @IsOptional()
  isVerified?: string;

  @IsString()
  @IsOptional()
  roleName?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
