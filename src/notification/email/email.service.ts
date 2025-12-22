import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { SendEMailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { SendExternalEmailDto } from './dto/send-external-email.dto';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  emailLogger = new Logger(EmailService.name);

  async sendMailToUser(sendEmailDto: SendEMailDto) {
    const { user, subject, template, context } = sendEmailDto;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject,
        template,
        context: context || {},
      });
      this.emailLogger.log(
        `Email sent to user : ${user.email} with subject: ${subject}`,
      );
    } catch (error) {
      this.emailLogger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to send email to user : ${user.email}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendBulkMailToUsers(sendBulkEmailDto: SendBulkEmailDto) {
    const { users, subject, template, context } = sendBulkEmailDto;
    const emailPromises = users.map(async (user) => {
      try {
        await this.mailerService.sendMail({
          to: user.email,
          subject,
          template,
          context: context || {},
        });
        this.emailLogger.log(
          `Email sent to user : ${user.email} with subject: ${subject}`,
        );
      } catch (error) {
        this.emailLogger.error(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Failed to send email to user : ${user.email}: ${error.message}`,
        );
        throw error;
      }
    });

    await Promise.all(emailPromises);
  }

  async sendExternalEmail(sendExternalEmailDto: SendExternalEmailDto) {
    const { recipientEmail, subject, template, context } = sendExternalEmailDto;
    try {
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject,
        template,
        context: context || {},
      });
      this.emailLogger.log(
        `Email sent to ${recipientEmail} with subject: ${subject}`,
      );
    } catch (error) {
      this.emailLogger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to send email to ${recipientEmail}: ${error.message}`,
      );
      throw error;
    }
  }
}
