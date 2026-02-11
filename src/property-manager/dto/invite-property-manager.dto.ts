import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { PERMISSIONS } from 'src/utils/constants';

export class InvitePropertyManagerDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsUUID('all', { each: true })
  propertyIds: string[];

  @IsEnum(PERMISSIONS, { each: true })
  permissions: PERMISSIONS[];
}
