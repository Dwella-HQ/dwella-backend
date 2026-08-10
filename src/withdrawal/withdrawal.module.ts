import { forwardRef, Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { JOB_NAMES } from 'src/utils/constants';
import { WithdrawalWorker } from './withdrawal.worker';
import { TransactionModule } from 'src/transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal]),
    forwardRef(() => WalletModule),
    forwardRef(() => TransactionModule),
    BullModule.registerQueue({
      name: JOB_NAMES.WITHDRAWAL_TRANSFER_JOB,
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
    BullBoardModule.forFeature({
      name: JOB_NAMES.WITHDRAWAL_TRANSFER_JOB,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService, WithdrawalWorker],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
