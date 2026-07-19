import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv, EnvironmentVariables } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { SeederModule } from './seeder/seeder.module';
import { AddressModule } from './address/address.module';
import { LandlordModule } from './landlord/landlord.module';
import { PropertyManagerModule } from './property-manager/property-manager.module';
import { AgentModule } from './agent/agent.module';
import { TenantModule } from './tenant/tenant.module';
import { NotificationModule } from './notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { ServicesModule } from './services/services.module';
import { FileModule } from './file/file.module';
import { PropertyModule } from './property/property.module';
import { WalletModule } from './wallet/wallet.module';
import { SettingsModule } from './settings/settings.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { VerificationModule } from './verification/verification.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { TransactionModule } from './transaction/transaction.module';
import { ChatModule } from './chat/chat.module';
import { MaintenanceRequestModule } from './maintenance-request/maintenance-request.module';
import { RentModule } from './rent/rent.module';
import { DepositModule } from './deposit/deposit.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { RentPaymentModule } from './rent-payment/rent-payment.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET_KEY'),
      }),
      global: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');
        const redisUsername = configService.get<string>('REDIS_USERNAME');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const nodeEnv = configService.get<string>('NODE_ENV');
        const enableTls = nodeEnv !== 'development';

        // Use 'rediss://' (double s) when TLS is enabled
        let redisUrl = enableTls ? `rediss://` : `redis://`;

        if (redisUsername && redisPassword) {
          redisUrl += `${redisUsername}:${redisPassword}@`;
        } else if (redisPassword) {
          redisUrl += `:${redisPassword}@`;
        }

        redisUrl += `${redisHost}:${redisPort}`;

        // const tlsOptions = enableTls
        //   ? {
        //       rejectUnauthorized: false, // For self-signed ElastiCache certs
        //       // Optional: provide custom CA certificate if needed
        //       // ca: [fs.readFileSync('/path/to/ca-cert.pem')],
        //     }
        //   : undefined;

        return {
          stores: [new KeyvRedis(redisUrl)],
        };
      },
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        prefix: '{bull}',
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD') ?? undefined,
          username: configService.get<string>('REDIS_USERNAME') ?? undefined,
          tls:
            configService.get<string>('NODE_ENV') !== 'development'
              ? {}
              : undefined,
          maxRetriesPerRequest: null, // 🛠️ Prevents creating new clients when a request fails
          enableOfflineQueue: false, // 🚀 Allow queuing commands when the connection is down
          enableReadyCheck: false, // ✅ Ensures the client is ready before processing commands
        },
        sharedConnection: true, // ✅ Use a single Redis connection for all queues
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    ThrottlerModule.forRoot(),
    UserModule,
    AuthModule,
    RbacModule,
    SeederModule,
    AddressModule,
    LandlordModule,
    PropertyManagerModule,
    AgentModule,
    TenantModule,
    NotificationModule,
    ServicesModule,
    FileModule,
    PropertyModule,
    WalletModule,
    SettingsModule,
    WebhooksModule,
    VerificationModule,
    AmenitiesModule,
    TransactionModule,
    ChatModule,
    MaintenanceRequestModule,
    RentModule,
    DepositModule,
    WithdrawalModule,
    RentPaymentModule,
    AnnouncementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
