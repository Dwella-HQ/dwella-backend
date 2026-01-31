/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { FlutterwaveChargeCompletedPayload } from 'src/services/flutterwave/flutterwave';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
import { MonnifyService } from 'src/services/monnify/monnify.service';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly monnifyService: MonnifyService,
    private readonly transactionService: TransactionService,
  ) {}
  @Get('paystack')
  handlePaystackWebhook(@Body() payload: any) {
    const eventType = payload.event;
    switch (eventType) {
      case 'dedicatedaccount.assign.success':
        this.paystackService.handleDedicatedAccountAssignSuccess(payload);
        break;
      default:
        throw new InternalServerErrorException(
          'Unhandled Paystack webhook event',
        );
    }
    return 'event handled successfully';
    // Implementation for handling Paystack webhooks will go here
  }

  @Get('flutterwave')
  async handleFlutterwaveWebhook(
    @Body() payload: { event: string; data: FlutterwaveChargeCompletedPayload },
  ) {
    const eventType = payload.event;
    switch (eventType) {
      case 'charge.completed':
        await this.transactionService.handleTransactionSuccess(
          payload.data.tx_ref,
          payload.data,
        );
        break;
      default:
        throw new InternalServerErrorException(
          'Unhandled Flutterwave webhook event',
        );
    }
    return 'event handled successfully';
    // Implementation for handling Flutterwave webhooks will go here
  }

  @Get('monnify')
  handleMonnifyWebhook(@Body() payload: any) {
    // Implementation for handling Monnify webhooks will go here
  }
}
