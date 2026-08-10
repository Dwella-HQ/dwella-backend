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

  @IsEnum(
    [
      PERMISSIONS.MANAGE_CHAT,
      PERMISSIONS.MANAGE_MAINTENANCE_REQUESTS,
      PERMISSIONS.READ_PAYMENT,
    ],
    { each: true },
  )
  permissions: PERMISSIONS[];
}
