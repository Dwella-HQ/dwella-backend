import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import type {
  FlutterwaveCreatePaymentLinkPayload,
  FlutterwaveCreateStaticVirtualAccountPayload,
  FlutterwaveCreateVirtualAccountResponse,
  FlutterwaveGetBanksResponse,
  FullterwaveTransactionWebhookPayload,
} from './flutterwave';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { JOB_NAMES, PaymentMethodEnum } from 'src/utils/constants';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { SettingsService } from 'src/settings/settings.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class FlutterwaveService {
  // Implement Flutterwave related methods here
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly settingsService: SettingsService,
    @InjectQueue(JOB_NAMES.HANDLE_TRANSACTION_JOB)
    private readonly transactionQueue: Queue,
  ) {}

  async createVirtualBankAccount(
    payload: FlutterwaveCreateStaticVirtualAccountPayload,
  ) {
    const response = await lastValueFrom(
      this.httpService.post<FlutterwaveCreateVirtualAccountResponse>(
        `virtual-account-numbers`,
        {
          email: payload.email,
          currency: payload.currency,
          amount: 0,
          firstname: payload.firstName,
          lastname: payload.lastName,
          tx_ref: payload.reference,
          is_permanent: true,
          bvn: payload.bvn,
          narration: `${payload.firstName} ${payload.lastName}`,
          phonenumber: payload.phoneNumber,
          bank_code: '035',
        },
      ),
    ).catch((err) => {
      console.error(
        'Error creating virtual bank account via Flutterwave:',
        err,
      );
      throw err;
    });

    return response.data;
  }

  // async confirmBankAccountNumber(
  //   confirmBankAccountNumberPayload: FlutterwaveConfirmBankAccountNumberRequest,
  // ) {
  //   const accessToken = await this.generateAccessToken();
  //   const response = await lastValueFrom(
  //     this.httpService.post<FlutterwaveConfirmBankAccountNumberResponse>(
  //       `https://developersandbox-api.flutterwave.com/banks/resolve-account`,
  //       {
  //         acccount: {
  //           code: confirmBankAccountNumberPayload.bank_code,
  //           number: confirmBankAccountNumberPayload.account_number,
  //         },
  //         currency:
  //           confirmBankAccountNumberPayload.currency || CurrenciesEnum.NGN,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       },
  //     ),
  //   ).catch((err) => {
  //     console.error('Error confirming bank account number:', err);
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     console.log(err.response?.data);
  //     throw err;
  //   });
  //   if (response.data.status !== 'success') {
  //     throw new BadRequestException('Failed to confirm bank account number');
  //   }
  //   return response.data;
  // }

  // async withdrawToBankAccount(
  //   payload: FlutterwaveWithdrawToBankAccountPayload,
  // ) {
  //   const accessToken = await this.generateAccessToken();
  //   const response = await lastValueFrom(
  //     this.httpService.post<{ data: any }>(
  //       `https://developersandbox-api.flutterwave.com/transfers`,
  //       {
  //         action: 'instant',
  //         payment_instruction: {
  //           source_currency: 'NGN',
  //           amount: {
  //             applies_to: 'destination_currency',
  //             value: payload.amount,
  //           },
  //           recipient: {
  //             bank: {
  //               account_type: 'checking',
  //               account_number: '014555',
  //               code: '055',
  //             },
  //             wallet: {
  //               provider: 'flutterwave',
  //             },
  //           },
  //           sender: {
  //             name: {
  //               first: 'Test',
  //               last: 'Payment',
  //             },
  //             phone: {
  //               country_code: '234',
  //               number: '7053332295',
  //             },
  //             address: {
  //               city: 'Ibadan',
  //               country: 'Nigeria',
  //               line1: 'Road 214, Off Tunji Bello Street',
  //               postal_code: '200285',
  //               state: 'Oyo',
  //             },
  //             email: 'johnsonolaolu@gmail.com',
  //           },
  //           destination_currency: 'NGN',
  //         },
  //         type: 'bank',
  //         reference: 'test',
  //         narration: 'test transfer',
  //         callback_url: 'test',
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       },
  //     ),
  //   ).catch((err) => {
  //     console.error('Error withdrawing to bank account:', err);
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     console.log(err.response?.data);
  //     throw err;
  //   });
  //   return response.data;
  //   // Implement withdrawal logic here
  // }

  async initiateWalletCredit(transaction: Transaction) {
    const paymentMethods = (await this.settingsService.getSetting(
      'paymentMethods',
    )) as PaymentMethodEnum[];
    const response = await lastValueFrom(
      this.httpService.post<FlutterwaveCreatePaymentLinkPayload>(`payments`, {
        amount: transaction.amount,
        tx_ref: transaction.id,
        currency: transaction.currency,
        redirect_url: `${this.configService.get<string>('FRONTEND_URL')}/dashboard/finance/deposit-callback
`,
        customer: {
          email: transaction.senderDetails.email,
          name: transaction.senderDetails.fullName,
        },
        customizations: {
          title: this.configService.get<string>('APP_NAME'),
        },
        max_retry_attempt: 5,
        payment_options: paymentMethods
          .flatMap((method) =>
            method === PaymentMethodEnum.BANK_TRANSFER
              ? ['ussd']
              : method === PaymentMethodEnum.CARD
                ? ['card']
                : [],
          )
          .join(','),
      }),
    ).catch((err) => {
      console.error('Error initiating wallet credit via Flutterwave:', err);
      throw err;
    });
    return response.data;
  }

  // async validateTransaction(
  //   reference: string,
  //   payload:
  //     | FlutterwaveChargeCompletedPayload
  //     | FlutterwaveTransferCompletedPayload,
  // ) {
  //   const response = await lastValueFrom(
  //     this.httpService.get<{
  //       status: string;
  //       message: string;
  //       data:
  //         | FlutterwaveChargeCompletedPayload
  //         | FlutterwaveTransferCompletedPayload;
  //     }>(
  //       `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
  //     ),
  //   ).catch((err) => {
  //     console.error('Error validating transaction via Flutterwave:', err);
  //     throw new InternalServerErrorException('Failed to validate transaction');
  //   });
  //   if (
  //     response.data.status !== 'success' ||
  //     response.data.data.amount !== payload.amount ||
  //     response.data.data.currency !== payload.currency
  //   ) {
  //     throw new InternalServerErrorException('Transaction validation failed');
  //   }
  //   return response.data;
  // }

  async handleChargeSuccess(payload: FullterwaveTransactionWebhookPayload) {
    if (
      !['CARD_TRANSACTION', 'BANK_TRANSFER_TRANSACTION'].includes(
        payload['event.type'],
      )
    ) {
      throw new Error('Invalid event type');
    }
    // const response = await lastValueFrom(
    //   this.httpService.get<{
    //     status: string;
    //     message: string;
    //     data: FlutterwaveChargeCompletedPayload['data'];
    //   }>(
    //     `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(payload.data.tx_ref)}`,
    //   ),
    // ).catch((err) => {
    //   console.error('Error validating transaction via Flutterwave:', err);
    //   throw new InternalServerErrorException('Failed to validate transaction');
    // });
    // if (
    //   response.data.status !== 'success' ||
    //   response.data.data.amount !== payload.data.amount ||
    //   response.data.data.currency !== payload.data.currency
    // ) {
    //   throw new InternalServerErrorException('Transaction validation failed');
    // }
    const paymentMethod =
      payload['event.type'] === 'CARD_TRANSACTION'
        ? PaymentMethodEnum.CARD
        : payload['event.type'] === 'BANK_TRANSFER_TRANSACTION'
          ? PaymentMethodEnum.BANK_TRANSFER
          : undefined;
    await this.transactionQueue.add(
      'handle_transaction_credit_success',
      {
        transactionId: payload.txRef,
        paymentMethod: paymentMethod,
        metadata: payload,
      } as {
        transactionId: string;
        paymentMethod: PaymentMethodEnum;
        metadata?: Record<string, any>;
      },
      { jobId: `transaction_success_${payload.txRef}` },
    );
    return payload;
  }

  async getBanks(currency: string) {
    const countryCode =
      currency === 'NGN' ? 'NG' : currency === 'GHS' ? 'GH' : null;
    if (!countryCode) {
      throw new InternalServerErrorException('Unsupported currency for banks');
    }
    const response = await lastValueFrom(
      this.httpService.get<FlutterwaveGetBanksResponse>(
        `/banks/${countryCode}`,
      ),
    ).catch((err) => {
      console.error('Error fetching banks via Flutterwave:', err);
      throw new InternalServerErrorException('Failed to fetch banks');
    });
    return response.data;
  }
}
