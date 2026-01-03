import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import type {
  PaystackAssignVirtualAccountPayload,
  PaystackAssignVirtualAccountResponse,
  PaystackCreateCustomerPayload,
  PaystackCustomerResponse,
  PaystackDedicatedAccountAssignSuccessWebhookPayload,
} from './paystack';
import { lastValueFrom } from 'rxjs';
import { EnvironmentVariables } from 'src/config/env.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaystackService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async customer(payload: PaystackCreateCustomerPayload) {
    const response = await lastValueFrom(
      this.httpService.post<PaystackCustomerResponse>('/customer', payload),
    );
    return response.data;
  }

  async assignVirtualAccount(payload: PaystackAssignVirtualAccountPayload) {
    const defaultPreferredBank =
      this.configService.get('NODE_ENV') === 'production'
        ? 'titan-paystack'
        : 'test-bank';
    const response = await lastValueFrom(
      this.httpService.post<PaystackAssignVirtualAccountResponse>(
        '/dedicated_account/assign',
        { ...payload, preferred_bank: defaultPreferredBank },
      ),
    );
    return response.data;
  }

  handleDedicatedAccountAssignSuccess(
    payload: PaystackDedicatedAccountAssignSuccessWebhookPayload,
  ) {
    if (payload.event !== 'dedicatedaccount.assign.success') {
      throw new Error('Invalid event type');
    }
  }
}
