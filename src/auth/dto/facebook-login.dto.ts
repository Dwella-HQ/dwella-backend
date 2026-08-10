import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NonAdminRoles, USER_ROLES } from 'src/utils/constants';

export class FacebookLoginDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsEnum(NonAdminRoles)
  roleName: USER_ROLES;
}
