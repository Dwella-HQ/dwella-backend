import { forwardRef, Module } from '@nestjs/common';
import { RentPaymentService } from './rent-payment.service';
import { RentPaymentController } from './rent-payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentPayment } from './entities/rent-payment.entity';
import { RentModule } from 'src/rent/rent.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentPayment]),
    RentModule,
    forwardRef(() => WalletModule),
    forwardRef(() => TransactionModule),
  ],
  controllers: [RentPaymentController],
  providers: [RentPaymentService],
  exports: [RentPaymentService],
})
export class RentPaymentModule {}
