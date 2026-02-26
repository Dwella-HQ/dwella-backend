import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { NextOfKinRelationshipEnum } from './constants';

export class TransferUserDetails {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNumberString()
  @IsOptional()
  bankCode?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsNumberString()
  @Length(10, 10)
  @IsOptional()
  accountNumber?: string;
}

export class NextOfKinDetails {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(NextOfKinRelationshipEnum)
  relationship: NextOfKinRelationshipEnum;

  @IsPhoneNumber()
  contactNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
