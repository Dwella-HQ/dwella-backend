import { IsEnum, IsOptional } from 'class-validator';
import { NotificationChannelEnum } from 'src/utils/constants';

export class UploadLandlordNotificationPreferencesDto {
  @IsEnum(NotificationChannelEnum, { each: true })
  @IsOptional()
  paymentNotifications: NotificationChannelEnum[];

  @IsEnum(NotificationChannelEnum, { each: true })
  @IsOptional()
  maintenanceRequestNotifications: NotificationChannelEnum[];

  @IsEnum(NotificationChannelEnum, { each: true })
  @IsOptional()
  overDueNotifications: NotificationChannelEnum[];

  @IsEnum(NotificationChannelEnum, { each: true })
  @IsOptional()
  weeklyReportsNotifications: NotificationChannelEnum[];
}
