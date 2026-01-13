/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaystackService } from 'src/services/paystack/paystack.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly paystackService: PaystackService) {}
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
  handleFlutterwaveWebhook(@Body() payload: any) {
    // Implementation for handling Flutterwave webhooks will go here
  }

  @Get('monnify')
  handleMonnifyWebhook(@Body() payload: any) {
    // Implementation for handling Monnify webhooks will go here
  }
}
