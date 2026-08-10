/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import {
  FlutterwaveChargeCompletedPayload,
  FullterwaveTransactionWebhookPayload,
} from 'src/services/flutterwave/flutterwave';
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

  @HttpCode(200)
  @Post('paystack')
  handlePaystackWebhook(@Body() payload: any) {
    console.log(payload);
    const eventType = payload.event;
    switch (eventType) {
      case 'dedicatedaccount.assign.success':
        void this.paystackService.handleDedicatedAccountAssignSuccess(payload);
        break;
      case 'charge.success':
        void this.paystackService.handleChargeSuccess(payload);
        break;
      case 'transfer.success':
        void this.paystackService.confirmWithdrawal(payload);
        break;
      default:
        throw new InternalServerErrorException(
          'Unhandled Paystack webhook event',
        );
    }
    return 'event handled successfully';
    // Implementation for handling Paystack webhooks will go here
  }

  @HttpCode(200)
  @Post('flutterwave')
  handleFlutterwaveWebhook(
    @Body() payload: { 'event.type': string; [key: string]: any },
  ) {
    // console.log(payload);
    const eventType = payload['event.type'];
    switch (eventType) {
      case 'BANK_TRANSFER_TRANSACTION':
      case 'CARD_TRANSACTION':
        void this.flutterwaveService.handleChargeSuccess(
          payload as FullterwaveTransactionWebhookPayload,
        );
        // case 'BANK_TRANSFER_TRANSACTION':
        // case 'BANK_TRANSFER_TRANSACTION':
        break;
      // case 'transfer.completed':
      //   await this.transactionService.
      default:
        throw new InternalServerErrorException(
          'Unhandled Flutterwave webhook event',
        );
    }
    return 'event handled successfully';
    // Implementation for handling Flutterwave webhooks will go here
  }

  @HttpCode(200)
  @Post('monnify')
  handleMonnifyWebhook(@Body() payload: any) {
    // Implementation for handling Monnify webhooks will go here
  }
}
