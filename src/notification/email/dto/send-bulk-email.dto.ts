import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { User } from 'src/user/entities/user.entity';

class UserWithEmail {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SendBulkEmailDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserWithEmail)
  users: User[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsOptional()
  @IsNotEmptyObject()
  context: Record<string, any>;
}
