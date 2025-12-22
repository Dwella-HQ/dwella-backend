import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

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
          // from: `"${configService.get<string>('APP_NAME')}" <no-reply@dwella-ng.com>`,
          // from: `email@example.com`,
          from: `Acme <onboarding@resend.dev>`,
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
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
