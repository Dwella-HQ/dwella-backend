import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { USER_ROLES } from 'src/utils/constants';
import { CreatePermissionDto } from './create-permission.dto';

export class CreateRoleDto {
  @IsEnum(USER_ROLES)
  name: USER_ROLES;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID('all', { each: true })
  permissionIds?: string[];
}

export class CreateRoleWithPermissionsDto {
  @IsEnum(USER_ROLES)
  name: USER_ROLES;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  permissions: CreatePermissionDto[];
}
