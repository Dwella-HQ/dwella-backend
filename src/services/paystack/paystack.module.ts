import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaystackService } from './paystack.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { JOB_NAMES } from 'src/utils/constants';
import { BullModule } from '@nestjs/bullmq';

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
    BullModule.registerQueue({
      name: JOB_NAMES.HANDLE_TRANSACTION_JOB,
    }),
  ],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaystackModule {}
