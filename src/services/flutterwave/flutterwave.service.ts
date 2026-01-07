import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import type {
  FlutterwaveCreateCustomerResponse,
  FlutterwaveCreateStaticVirtualAccountPayload,
  FlutterwaveCreateStaticVirtualAccountResponse,
  FlutterwaveGenerateAccessTokenResponse,
} from './flutterwave';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';

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
    );
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
        `https://developersandbox-api.flutterwave.com/virtual-account-numbers`,
        {
          customer_id: customerId,
          currency: payload.currency,
          bvn: payload.bvn,
          reference: payload.reference,
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
    );
    return response.data;
  }
}
