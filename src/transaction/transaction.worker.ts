import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
import { MonnifyService } from 'src/services/monnify/monnify.service';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { SettingsService } from 'src/settings/settings.service';
import { JOB_NAMES, PaymentProviderEnum } from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';
import { Transaction } from './entities/transaction.entity';

@Processor(JOB_NAMES.HANDLE_TRANSACTION_JOB)
export class TransactionWorker extends WorkerHost {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly monnifyService: MonnifyService,
    private readonly walletService: WalletService,
    private readonly settingsService: SettingsService,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'initiate-credit-transaction': {
        const transaction = job.data as Transaction;
        const provider = (await this.settingsService.getSetting(
          'preferredPaymentProvider',
        )) as PaymentProviderEnum;
        if (provider === PaymentProviderEnum.PAYSTACK) {
          const response =
            await this.paystackService.initiateWalletCredit(transaction);
        }
        if (provider === PaymentProviderEnum.FLUTTERWAVE) {
          const response =
            await this.flutterwaveService.initiateWalletCredit(transaction);
        }
        if (provider === PaymentProviderEnum.MONNIFY) {
          const response =
            await this.monnifyService.initiateWalletCredit(transaction);
        }
        return {};
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
