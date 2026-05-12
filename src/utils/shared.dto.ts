import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { NextOfKinRelationshipEnum } from './constants';

export class TransferUserDetails {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

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

export class SendUserNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class BankAccountDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  accountName!: string;

  @IsString()
  @IsNotEmpty()
  accountCode!: string;

  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  bvn!: string;
}