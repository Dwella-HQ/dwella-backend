import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PaystackService } from 'src/services/paystack/paystack.service';
import {
  CurrenciesEnum,
  JOB_NAMES,
  PaymentProviderEnum,
} from 'src/utils/constants';
import { WalletService } from './wallet.service';
import { breakDownFullName } from 'src/utils/misc';
import { Wallet } from './entities/wallet.entity';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
import { MonnifyService } from 'src/services/monnify/monnify.service';

@Processor(JOB_NAMES.VBA_CREATION_JOB)
export class WalletWorker extends WorkerHost {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly monnifyService: MonnifyService,
    private readonly walletService: WalletService,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'create-virtual-account:paystack': {
        const wallet = job.data as Wallet;
        const { firstName, middleName, lastName } = breakDownFullName(
          wallet.landlord.landLordName,
        );
        const response = await this.paystackService.assignVirtualAccount({
          email: wallet.landlord.user.email,
          country: wallet.currency === CurrenciesEnum.NGN ? 'NG' : 'NG',
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          phone: wallet.landlord.user.phoneNumber,
          bvn: wallet.bvn,
          metadata: { walletId: wallet.id },
        });
        return response;
      }
      case 'create-virtual-account:monnify': {
        const wallet = job.data as Wallet;
        const response = await this.monnifyService.createVirtualAccount({
          accountName: wallet.landlord.landLordName,
          customerEmail: wallet.landlord.user.email,
          bvn: wallet.bvn,
          accountReference: wallet.id,
          currencyCode: wallet.currency,
          customerName: wallet.landlord.landLordName,
        });
        const vba = await this.walletService.createVba(wallet.id, {
          accountName: response.responseBody.accounts[0].accountName,
          accountNumber: response.responseBody.accounts[0].accountNumber,
          bankName: response.responseBody.accounts[0].bankName,
          bankCode: response.responseBody.accounts[0].bankCode,
          metadata: response.responseBody,
          provider: PaymentProviderEnum.MONNIFY,
        });
        return vba;
      }
      case 'create-virtual-account:flutterwave': {
        const wallet = job.data as Wallet;
        const { firstName, lastName } = breakDownFullName(
          wallet.landlord.landLordName,
        );
        const response = await this.flutterwaveService.createVirtualBankAccount(
          {
            currency: wallet.currency,
            email: wallet.landlord.user.email,
            firstName: firstName,
            lastName: lastName,
            bvn: wallet.bvn,
            reference: wallet.id,
          },
        );
        const vba = await this.walletService.createVba(wallet.id, {
          accountName: response.data.account_bank_name,
          accountNumber: response.data.account_number,
          bankCode: '',
          bankName: response.data.account_bank_name,
          metadata: response.data,
          provider: PaymentProviderEnum.FLUTTERWAVE,
        });
        return vba;
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
