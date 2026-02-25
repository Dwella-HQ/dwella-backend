/* eslint-disable @typescript-eslint/no-unused-vars */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
import { MonnifyService } from 'src/services/monnify/monnify.service';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { SettingsService } from 'src/settings/settings.service';
import {
  JOB_NAMES,
  PaymentMethodEnum,
  PaymentProviderEnum,
  TransactionActionEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';
import { Transaction } from './entities/transaction.entity';
import {
  FlutterwaveChargeCompletedPayload,
  FlutterwaveTransferCompletedPayload,
} from 'src/services/flutterwave/flutterwave';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VbaService } from 'src/wallet/vba/vba.service';

@Processor(JOB_NAMES.HANDLE_TRANSACTION_JOB)
export class TransactionWorker extends WorkerHost {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly monnifyService: MonnifyService,
    private readonly walletService: WalletService,
    private readonly vbaService: VbaService,
    private readonly settingsService: SettingsService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'handle_transaction_credit_success': {
        return Promise.resolve();
      }
      case 'handle_vba_transaction_credit_success': {
        const { vbaNumber, amount, narration, metadata } = job.data as {
          vbaNumber: string;
          amount: number;
          narration?: string;
          metadata?: Record<string, any>;
        };
        return Promise.resolve();
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
