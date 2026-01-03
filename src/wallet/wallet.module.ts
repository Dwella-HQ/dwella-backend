import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { VbaModule } from './vba/vba.module';
import { WalletWorker } from './wallet.worker';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletWorker],
  imports: [VbaModule],
})
export class WalletModule {}
