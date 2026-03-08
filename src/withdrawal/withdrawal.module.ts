import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { JOB_NAMES } from 'src/utils/constants';
import { WithdrawalWorker } from './withdrawal.worker';

@Module({
  imports: [
    WalletModule,
    BullModule.registerQueue({
      name: JOB_NAMES.WITHDRAWAL_TRANSFER_JOB,
    }),
    BullBoardModule.forFeature({
      name: JOB_NAMES.WITHDRAWAL_TRANSFER_JOB,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService, WithdrawalWorker],
})
export class WithdrawalModule {}
