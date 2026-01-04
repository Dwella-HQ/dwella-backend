import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaystackService } from './paystack.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('PAYSTACK_BASE_URL'),
        headers: {
          Authorization: `Bearer ${configService.get<string>('PAYSTACK_SECRET_KEY')}`,
        },
      }),
    }),
    WalletModule,
  ],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaystackModule {}
