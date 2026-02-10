import { Module } from '@nestjs/common';
import { AppNotificationService } from './app.service';
import { AppNotificationGateway } from './app.gateway';
import { AppNotificationWorker } from './app.worker';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { JOB_NAMES } from 'src/utils/constants';

@Module({
  imports: [
    UserModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET_KEY')!,
      }),
    }),
    BullModule.registerQueue({
      name: JOB_NAMES.APP_NOTIFICATION,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
    BullBoardModule.forFeature({
      name: JOB_NAMES.APP_NOTIFICATION,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    AppNotificationGateway,
    AppNotificationService,
    AppNotificationWorker,
  ],
})
export class AppModule {}
