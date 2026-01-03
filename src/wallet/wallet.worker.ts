/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { JOB_NAMES } from 'src/utils/constants';
import { WalletService } from './wallet.service';
import { VbaService } from './vba/vba.service';

@Processor(JOB_NAMES.VBA_CREATION_JOB)
export class WalletWorker extends WorkerHost {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly walletService: WalletService,
    private readonly vbaService: VbaService,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'create-virtual-account:paystack': {
        const {
          accountName,
          accountNumber,
          bankName,
          bankCode,
          currency,
          metadata,
          email,
        } = job.data;
        // const response = await this.paystackService.assignVirtualAccount({
        //     email : email,

        // });
        // return response;
        break;
      }
      case 'create-virtual-account:monnify': {
        return;
      }
      case 'create-virtual-account:flutterwave': {
        return;
      }
      case 'assign-virtual-account-wallet': {
        const {
          accountName,
          accountNumber,
          bankName,
          bankCode,
          currency,
          metadata,
          provider,
          walletId,
        } = job.data;
        const wallet = await this.walletService.findOne(walletId);
        const vba = await this.vbaService.createVBA({
          accountName,
          accountNumber,
          bankName,
          bankCode,
          currency,
          metadata,
          provider,
          walletId: wallet.id,
        });
        return vba;
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
