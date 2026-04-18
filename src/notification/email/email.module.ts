import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailWorker } from './email.worker';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { BullModule } from '@nestjs/bullmq';
import { JOB_NAMES } from 'src/utils/constants';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        transport: {
          host: 'smtp.resend.com',
          port: '465',
          secure: true,
          auth: {
            user: 'resend',
            pass: configService.get<string>('RESEND_API_KEY'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('APP_NAME')}" <no-reply@dwella-ng.com>`,
        },
        template: {
          dir: join(__dirname, '../../templates/email'),
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: join(__dirname, '../../templates/email', 'partials'),
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
    BullModule.registerQueue({
      name: JOB_NAMES.EMAIL_NOTIFICATION,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
    BullBoardModule.forFeature({
      name: JOB_NAMES.EMAIL_NOTIFICATION,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [EmailService, EmailWorker],
  exports: [EmailService],
})
export class EmailModule {}
