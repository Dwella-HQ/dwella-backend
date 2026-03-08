import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { SettingsService } from 'src/settings/settings.service';
import { JOB_NAMES } from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';

@Processor(JOB_NAMES.WITHDRAWAL_TRANSFER_JOB)
export class WithdrawalWorker extends WorkerHost {
  constructor(
    private readonly walletService: WalletService,
    private readonly paystackService: PaystackService,
    private readonly settingsService: SettingsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'hello': {
        console.log('Hello world');
        break;
      }
    }
  }
}
