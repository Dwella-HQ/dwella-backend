import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get<string>('FLUTTERWAVE_BASE_URL'),
        headers: {
          Authorization: `Bearer ${configService.get<string>(
            'FLUTTERWAVE_SECRET_KEY',
          )}`,
          'Content-Type': 'application/json',
        },
      }),
    }),
  ],
  providers: [FlutterwaveService],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}
