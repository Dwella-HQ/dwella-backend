import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { INVITE_STATUS } from 'src/utils/constants';

export class QueryInviteDto {
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search?: string;

  @IsEnum(INVITE_STATUS)
  status?: INVITE_STATUS;
}
