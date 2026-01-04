import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { VbaModule } from './vba/vba.module';
import { WalletWorker } from './wallet.worker';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransactions } from './entities/wallet-transactions.entity';
import { LandlordModule } from 'src/landlord/landlord.module';
import { UserModule } from 'src/user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { JOB_NAMES } from 'src/utils/constants';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransactions]),
    VbaModule,
    LandlordModule,
    UserModule,
    BullModule.registerQueue({
      name: JOB_NAMES.VBA_CREATION_JOB,
    }),
    BullBoardModule.forFeature({
      name: JOB_NAMES.VBA_CREATION_JOB,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [WalletController],
  providers: [WalletService, WalletWorker],
  exports: [WalletService],
})
export class WalletModule {}
