import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { Deposit } from './entities/deposit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from 'src/wallet/wallet.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    WalletModule,
    TransactionModule,
  ],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}
