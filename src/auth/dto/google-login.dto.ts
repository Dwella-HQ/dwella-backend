import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { USER_ROLES } from 'src/utils/constants';

export class GoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsEnum(USER_ROLES)
  roleName: USER_ROLES;
}
