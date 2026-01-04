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
import { PaymentProviderEnum } from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class PaystackService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly walletService: WalletService,
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

  async handleDedicatedAccountAssignSuccess(
    payload: PaystackDedicatedAccountAssignSuccessWebhookPayload,
  ) {
    if (payload.event !== 'dedicatedaccount.assign.success') {
      throw new Error('Invalid event type');
    }
    const wallet = await this.walletService.createVba(
      payload.data.customer.metadata.walletId as string,
      {
        accountName: payload.data.dedicated_account.account_name,
        accountNumber: payload.data.dedicated_account.account_number,
        bankName: payload.data.dedicated_account.bank.name,
        bankCode: payload.data.dedicated_account.bank.slug,
        provider: PaymentProviderEnum.PAYSTACK,
        metadata: payload.data,
      },
    );
    return wallet;
  }
}
