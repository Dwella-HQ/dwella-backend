import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';
import { base64Encode } from 'src/utils/misc';
import type {
  MonnifyCreateVirtualAccountPayload,
  MonnifyCreateVirtualAccountResponse,
  MonnifyInitiateWalletCreditResponse,
  MonnifyLoginResponse,
} from './monnify';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { SettingsService } from 'src/settings/settings.service';
import { PaymentMethodEnum } from 'src/utils/constants';

@Injectable()
export class MonnifyService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly settingsService: SettingsService,
  ) {}

  async getAccessToken(): Promise<string> {
    const cachedToken = await this.cacheManager.get<string>(
      'monnify_access_token',
    );
    if (cachedToken) {
      return cachedToken;
    }
    const key = base64Encode(
      `${this.configService.get<string>('MONNIFY_API_KEY')}:${this.configService.get<string>('MONNIFY_SECRET_KEY')}`,
    );
    console.log({
      key,
      apiKey: this.configService.get<string>('MONNIFY_API_KEY'),
      secretKey: this.configService.get<string>('MONNIFY_SECRET_KEY'),
    });
    const response = await lastValueFrom(
      this.httpService.post<MonnifyLoginResponse>(
        '/api/v1/auth/login',
        {},
        {
          headers: { Authorization: `Basic ${key}` },
        },
      ),
    ).catch((error) => {
      console.error('Error fetching Monnify access token:', error);
      throw error;
    });
    const { accessToken, expiresIn } = response.data.responseBody;
    await this.cacheManager.set(
      'monnify_access_token',
      accessToken,
      expiresIn - 60,
    ); // Subtracting 60 seconds to ensure token validity
    return accessToken;
  }

  async createVirtualAccount(payload: MonnifyCreateVirtualAccountPayload) {
    const accessToken = await this.getAccessToken();
    const response = await lastValueFrom(
      this.httpService.post<MonnifyCreateVirtualAccountResponse>(
        '/api/v2/bank-transfer/reserved-accounts',
        {
          ...payload,
          contractCode: this.configService.get<string>('MONNIFY_CONTRACT_CODE'),
          getAllAvailableBanks: true,
          preferredBanks: ['50515'],
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ),
    ).catch((error) => {
      console.error('Error creating Monnify virtual account:', error);
      throw error;
    });
    return response.data;
  }

  async initiateWalletCredit(transaction: Transaction) {
    const paymentMethods = (await this.settingsService.getSetting(
      'paymentMethods',
    )) as PaymentMethodEnum[];
    const accessToken = await this.getAccessToken();
    const response = await lastValueFrom(
      this.httpService.post<MonnifyInitiateWalletCreditResponse>(
        '/api/v1/merchant/transactions/init-transaction',
        {
          amount: transaction.amount,
          customerEmail: transaction.senderDetails.email,
          paymentReference: transaction.id,
          paymentDescription: transaction.narration,
          currencyCode: transaction.currency,
          contractCode: this.configService.get<string>('MONNIFY_CONTRACT_CODE'),
          redirectUrl: `${this.configService.get<string>('BACKEND_URL')}/transaction/success`,
          paymentMethods: paymentMethods.flatMap((method) =>
            method === PaymentMethodEnum.BANK_TRANSFER
              ? ['ACCOUNT_TRANSFER']
              : method === PaymentMethodEnum.CARD
                ? ['CARD']
                : [],
          ),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ),
    ).catch((error) => {
      console.error(
        'Error initiating Monnify wallet credit:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.response?.data,
      );
      throw new InternalServerErrorException(
        'Failed to initiate wallet credit',
      );
    });
    return response.data;
  }
}
