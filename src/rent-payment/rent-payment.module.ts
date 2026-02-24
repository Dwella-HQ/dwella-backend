import { Module } from '@nestjs/common';
import { RentPaymentService } from './rent-payment.service';
import { RentPaymentController } from './rent-payment.controller';

@Module({
  controllers: [RentPaymentController],
  providers: [RentPaymentService],
})
export class RentPaymentModule {}
