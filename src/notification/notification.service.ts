import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { User } from 'src/user/entities/user.entity';
import {
  NotificationMediumEnum,
  NotificationTypeEnum,
  UniqueNotificationMediumArray,
} from 'src/utils/constants';
import { AppNotificationService } from './app/app.service';
import { formatHbsText } from 'src/utils/misc';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly appService: AppNotificationService,
  ) {}

  async sendNotificationToUser(
    user: User,
    {
      title = 'Notification',
      medium,
      templateName,
      context,
      isPopup = false,
      notificationType = NotificationTypeEnum.INFO,
    }: {
      title?: string;
      medium: UniqueNotificationMediumArray<NotificationMediumEnum[]>;
      templateName: string;
      context: Record<string, any>;
      isPopup?: boolean;
      notificationType?: NotificationTypeEnum;
    },
  ) {
    if (medium.includes(NotificationMediumEnum.EMAIL)) {
      await this.emailService.sendMailToUser({
        user,
        subject: title,
        template: templateName.replace(/\./g, '/'),
        context,
      });
    }
    if (medium.includes(NotificationMediumEnum.APP)) {
      await this.appService.createNotification({
        userId: user.id,
        action: '',
        data: context,
        message: formatHbsText(templateName, context),
        popup: isPopup,
        type: notificationType,
      });
    }
  }
}
