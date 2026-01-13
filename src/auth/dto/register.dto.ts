import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import {
  NonAdminRoles,
  RegistrationTypeEnum,
  USER_ROLES,
} from 'src/utils/constants';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsEnum(NonAdminRoles)
  roleName: USER_ROLES;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsEnum(RegistrationTypeEnum)
  @IsOptional()
  registrationType?: RegistrationTypeEnum;
}
