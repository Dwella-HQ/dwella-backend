import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { SendEMailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { SendExternalEmailDto } from './dto/send-external-email.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { JOB_NAMES } from 'src/utils/constants';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    @InjectQueue(JOB_NAMES.EMAIL_NOTIFICATION)
    private readonly emailNotificationQueue: Queue,
  ) {}

  async sendMailToUser(sendEmailDto: SendEMailDto) {
    const { user, subject, template, context } = sendEmailDto;
    await this.emailNotificationQueue.add('send-email', {
      to: user.email,
      subject,
      template,
      context: context || {},
    });
    return true;
  }

  async sendBulkMailToUsers(sendBulkEmailDto: SendBulkEmailDto) {
    const { users, subject, template, context } = sendBulkEmailDto;
    const emailPromises = users.map(async (user) => {
      await this.emailNotificationQueue.add('send-email', {
        to: user.email,
        subject,
        template,
        context: context || {},
      });
    });

    await Promise.all(emailPromises);
  }

  async sendExternalEmail(sendExternalEmailDto: SendExternalEmailDto) {
    const { recipientEmail, subject, template, context } = sendExternalEmailDto;
    await this.emailNotificationQueue.add('send-email', {
      to: recipientEmail,
      subject,
      template,
      context: context || {},
    });
    return true;
  }
}
