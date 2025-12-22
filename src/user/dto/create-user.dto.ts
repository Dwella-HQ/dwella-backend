import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RegistrationTypeEnum } from 'src/utils/constants';

export class CreateUserDto {
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

  @IsString()
  @IsNotEmpty()
  roleName: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsEnum(RegistrationTypeEnum)
  @IsOptional()
  registrationType?: RegistrationTypeEnum;
}
