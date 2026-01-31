import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import type {
  FlutterwaveCreatePaymentLinkPayload,
  FlutterwaveCreateStaticVirtualAccountPayload,
  FlutterwaveCreateVirtualAccountResponse,
} from './flutterwave';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { PaymentMethodEnum } from 'src/utils/constants';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class FlutterwaveService {
  // Implement Flutterwave related methods here
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly settingsService: SettingsService,
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
        redirect_url: `${this.configService.get<string>('BACKEND_URL')}/transaction/success`,
        customer: {
          email: transaction.senderDetails.email,
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
    console.log(response.data);
    return response.data;
  }
}
