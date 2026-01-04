import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';
import { base64Encode } from 'src/utils/misc';
import type {
  MonnifyCreateVirtualAccountPayload,
  MonnifyCreateVirtualAccountResponse,
  MonnifyLoginResponse,
} from './monnify';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';

@Injectable()
export class MonnifyService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async getAccessToken(): Promise<string> {
    const cachedToken = await this.cacheManager.get<string>(
      'monnify_access_token',
    );
    if (cachedToken) {
      return cachedToken;
    }
    const key = base64Encode(
      `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_API_SECRET}`,
    );
    const response = await lastValueFrom(
      this.httpService.post<MonnifyLoginResponse>(
        '/api/v1/auth/login',
        {},
        {
          headers: { Authorization: `Basic ${key}` },
        },
      ),
    );
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
    );
    return response.data;
  }
}
