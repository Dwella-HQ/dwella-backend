import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class LoginSecurityDto {
  @IsPhoneNumber()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
