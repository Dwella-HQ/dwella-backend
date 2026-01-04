import { Module } from '@nestjs/common';
import { MonnifyService } from './monnify.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EnvironmentVariables } from 'src/config/env.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        baseURL: configService.get<string>('MONNIFY_BASE_URL'),
      }),
    }),
  ],
  providers: [MonnifyService],
  exports: [MonnifyService],
})
export class MonnifyModule {}
