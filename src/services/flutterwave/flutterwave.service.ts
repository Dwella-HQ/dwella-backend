import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import type {
  FlutterwaveConfirmBankAccountNumberRequest,
  FlutterwaveConfirmBankAccountNumberResponse,
  FlutterwaveCreateCustomerResponse,
  FlutterwaveCreateStaticVirtualAccountPayload,
  FlutterwaveCreateStaticVirtualAccountResponse,
  FlutterwaveGenerateAccessTokenResponse,
  FlutterwaveWithdrawToBankAccountPayload,
} from './flutterwave';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { CurrenciesEnum } from 'src/utils/constants';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Injectable()
export class FlutterwaveService {
  // Implement Flutterwave related methods here
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async generateAccessToken(): Promise<string> {
    const cachedToken = await this.cacheManager.get<string>(
      'flutterwave_access_token',
    );
    if (cachedToken) {
      return cachedToken;
    }
    const response = await lastValueFrom(
      this.httpService.post<FlutterwaveGenerateAccessTokenResponse>(
        'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token',
        new URLSearchParams({
          client_id: this.configService.get<string>(
            'FLUTTERWAVE_CLIENT_ID',
          ) as string,
          client_secret: this.configService.get<string>(
            'FLUTTERWAVE_CLIENT_SECRET',
          ) as string,
          grant_type: 'client_credentials',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      ),
    ).catch((err) => {
      console.error('Error generating Flutterwave access token:', err);
      throw err;
    });
    const { access_token, expires_in } = response.data;
    await this.cacheManager.set(
      'flutterwave_access_token',
      access_token,
      expires_in - 60,
    ); // Subtracting 60 seconds to ensure token validity
    return access_token;
  }

  async createVirtualBankAccount(
    payload: FlutterwaveCreateStaticVirtualAccountPayload,
  ) {
    const accessToken = await this.generateAccessToken();
    const createCustomerResponse = await lastValueFrom(
      this.httpService.post<FlutterwaveCreateCustomerResponse>(
        `https://developersandbox-api.flutterwave.com/customers`,
        {
          name: {
            first: payload.firstName,
            last: payload.lastName,
          },
          email: payload.email,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Idempotency-Key': payload.reference,
          },
        },
      ),
    );
    const customerId = createCustomerResponse.data.data.id;
    const response = await lastValueFrom(
      this.httpService.post<FlutterwaveCreateStaticVirtualAccountResponse>(
        `https://developersandbox-api.flutterwave.com/virtual-accounts`,
        {
          customer_id: customerId,
          currency: payload.currency,
          bvn: payload.bvn,
          reference: payload.reference,
          account_type: 'static',
          amount: 0,
          narration: `${payload.firstName} ${payload.lastName} Virtual Account`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Idempotency-Key': payload.reference,
          },
        },
      ),
    ).catch((err) => {
      console.error('Error creating Flutterwave virtual account:', err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(err.response?.data);
      throw err;
    });
    return response.data;
  }

  async confirmBankAccountNumber(
    confirmBankAccountNumberPayload: FlutterwaveConfirmBankAccountNumberRequest,
  ) {
    const accessToken = await this.generateAccessToken();
    const response = await lastValueFrom(
      this.httpService.post<FlutterwaveConfirmBankAccountNumberResponse>(
        `https://developersandbox-api.flutterwave.com/banks/resolve-account`,
        {
          acccount: {
            code: confirmBankAccountNumberPayload.bank_code,
            number: confirmBankAccountNumberPayload.account_number,
          },
          currency:
            confirmBankAccountNumberPayload.currency || CurrenciesEnum.NGN,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    ).catch((err) => {
      console.error('Error confirming bank account number:', err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(err.response?.data);
      throw err;
    });
    if (response.data.status !== 'success') {
      throw new BadRequestException('Failed to confirm bank account number');
    }
    return response.data;
  }

  async withdrawToBankAccount(
    payload: FlutterwaveWithdrawToBankAccountPayload,
  ) {
    const accessToken = await this.generateAccessToken();
    const response = await lastValueFrom(
      this.httpService.post<{ data: any }>(
        `https://developersandbox-api.flutterwave.com/transfers`,
        {
          action: 'instant',
          payment_instruction: {
            source_currency: 'NGN',
            amount: {
              applies_to: 'destination_currency',
              value: payload.amount,
            },
            recipient: {
              bank: {
                account_type: 'checking',
                account_number: '014555',
                code: '055',
              },
              wallet: {
                provider: 'flutterwave',
              },
            },
            sender: {
              name: {
                first: 'Test',
                last: 'Payment',
              },
              phone: {
                country_code: '234',
                number: '7053332295',
              },
              address: {
                city: 'Ibadan',
                country: 'Nigeria',
                line1: 'Road 214, Off Tunji Bello Street',
                postal_code: '200285',
                state: 'Oyo',
              },
              email: 'johnsonolaolu@gmail.com',
            },
            destination_currency: 'NGN',
          },
          type: 'bank',
          reference: 'test',
          narration: 'test transfer',
          callback_url: 'test',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    ).catch((err) => {
      console.error('Error withdrawing to bank account:', err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(err.response?.data);
      throw err;
    });
    return response.data;
    // Implement withdrawal logic here
  }

  async initiateWalletCredit(transaction: Transaction) {
    const response = await lastValueFrom(
      this.httpService.post(`direct-transfers`, {
        action: 'instant',
        payment_instruction: {
          source_currency: transaction.wallet.currency,
          amount: {
            applies_to: 'destination_currency',
            value: transaction.amount,
          },
          recipient: {
            bank: {
              account_type: 'checking',
              account_number: '014555',
              code: '055',
            },
            wallet: {
              provider: 'flutterwave',
            },
          },
          sender: {
            name: {
              first: 'Test',
              last: 'Payment',
            },
            phone: {
              country_code: '234',
              number: '7053332295',
            },
            address: {
              city: 'Ibadan',
              country: 'Nigeria',
              line1: 'Road 214, Off Tunji Bello Street',
              postal_code: '200285',
              state: 'Oyo',
            },
            email: 'johnsonolaolu@gmail.com',
          },
          destination_currency: 'NGN',
        },
        type: 'bank',
        reference: 'test',
        narration: 'test transfer',
        callback_url: 'test',
      }),
    ).catch((err) => {
      console.error('Error initiating wallet credit via Flutterwave:', err);
      throw err;
    });
    return response.data;
  }
}
