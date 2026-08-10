import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotificationTypeEnum } from 'src/utils/constants';

export class CreateAppNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsEnum(NotificationTypeEnum)
  type?: NotificationTypeEnum;

  @IsBoolean()
  @IsOptional()
  popup?: boolean;

  @IsOptional()
  data: any;
}
