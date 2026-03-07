/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import type {
  PaystackAssignVirtualAccountPayload,
  PaystackAssignVirtualAccountResponse,
  PaystackChargeSuccessWebhookPayload,
  PaystackCreateCustomerPayload,
  PaystackCustomerResponse,
  PaystackDedicatedAccountAssignSuccessWebhookPayload,
  PaystackInitializeTransactionResponse,
  PaystackTransactionVerificationResponse,
} from './paystack';
import { lastValueFrom } from 'rxjs';
import { EnvironmentVariables } from 'src/config/env.config';
import { ConfigService } from '@nestjs/config';
import {
  JOB_NAMES,
  PaymentMethodEnum,
  PaymentProviderEnum,
} from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { SettingsService } from 'src/settings/settings.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TransferUserDetails } from 'src/utils/shared.dto';

@Injectable()
export class PaystackService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly walletService: WalletService,
    private readonly settingsService: SettingsService,
    @InjectQueue(JOB_NAMES.HANDLE_TRANSACTION_JOB)
    private readonly transactionQueue: Queue,
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
    ).catch((error) => {
      console.error(error);
      throw new Error('Failed to assign virtual account');
    });
    return response.data;
  }

  async handleDedicatedAccountAssignSuccess(
    payload: PaystackDedicatedAccountAssignSuccessWebhookPayload,
  ) {
    if (payload.event !== 'dedicatedaccount.assign.success') {
      throw new Error('Invalid event type');
    }
    const wallet = await this.walletService.assignVba(
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

  async initiateWalletCredit(transaction: Transaction) {
    const paymentMethods = (await this.settingsService.getSetting(
      'paymentMethods',
    )) as PaymentMethodEnum[];
    const response = await lastValueFrom(
      this.httpService.post<PaystackInitializeTransactionResponse>(
        '/transaction/initialize',
        {
          email: transaction.wallet.landlord.user.email,
          amount: transaction.amount * 100,
          reference: transaction.id,
          currency: transaction.currency,
          // redirect_url: `${this.configService.get<string>('BACKEND_URL')}/transaction/success`,
          channels: paymentMethods.flatMap((method) =>
            method === PaymentMethodEnum.BANK_TRANSFER
              ? ['bank']
              : method === PaymentMethodEnum.CARD
                ? ['card']
                : [],
          ),
        },
      ),
    );
    return response.data;
  }

  async handleChargeSuccess(payload: PaystackChargeSuccessWebhookPayload) {
    if (payload.event !== 'charge.success') {
      throw new Error('Invalid event type');
    }
    const response = await lastValueFrom(
      this.httpService.get<PaystackTransactionVerificationResponse>(
        `/transaction/verify/${payload.data.reference}`,
      ),
    );
    if (!response.data.status || response.data.data.status !== 'success') {
      throw new Error('Transaction verification failed');
    }
    switch (payload.data.channel) {
      case 'dedicated_nuban': {
        await this.transactionQueue.add(
          'handle_vba_transaction_credit_success',
          {
            vbaNumber: payload.data.metadata.receiver_account_number,
            amount: payload.data.amount / 100,
            narration: undefined,
            metadata: payload.data,
            provider: PaymentProviderEnum.PAYSTACK,
          },
          { jobId: `transaction_success_${payload.data.reference}` },
        );
        return;
      }
      case 'bank': {
        await this.transactionQueue.add(
          'handle_transaction_credit_success',
          {
            transactionId: payload.data.reference,
            paymentMethod: PaymentMethodEnum.BANK_TRANSFER,
            metadata: payload.data,
          } as {
            transactionId: string;
            paymentMethod: PaymentMethodEnum;
            metadata?: Record<string, any>;
          },
          { jobId: `transaction_success_${payload.data.reference}` },
        );
        return;
      }
      case 'card': {
        await this.transactionQueue.add(
          'handle_transaction_credit_success',
          {
            transactionId: payload.data.reference,
            metadata: payload.data,
          },
          { jobId: `transaction_success_${payload.data.reference}` },
        );
        return;
      }
      default: {
        throw new Error('Unknown payment channel');
      }
    }
  }
}
