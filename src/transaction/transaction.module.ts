import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from 'src/wallet/wallet.module';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { JOB_NAMES } from 'src/utils/constants';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { TransactionWorker } from './transaction.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    forwardRef(() => WalletModule),
    BullModule.registerQueue({
      name: JOB_NAMES.VBA_CREATION_JOB,
    }),
    BullBoardModule.forFeature({
      name: JOB_NAMES.VBA_CREATION_JOB,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionWorker],
  exports: [TransactionService],
})
export class TransactionModule {}
