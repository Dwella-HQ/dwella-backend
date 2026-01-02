import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { VbaModule } from './vba/vba.module';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
  imports: [VbaModule],
})
export class WalletModule {}
