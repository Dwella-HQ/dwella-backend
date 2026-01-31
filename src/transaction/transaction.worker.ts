import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
import { MonnifyService } from 'src/services/monnify/monnify.service';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { SettingsService } from 'src/settings/settings.service';
import {
  JOB_NAMES,
  TransactionActionEnum,
  TransactionStatusEnum,
} from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';
import { Transaction } from './entities/transaction.entity';
import { FlutterwaveChargeCompletedPayload } from 'src/services/flutterwave/flutterwave';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Processor(JOB_NAMES.HANDLE_TRANSACTION_JOB)
export class TransactionWorker extends WorkerHost {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly monnifyService: MonnifyService,
    private readonly walletService: WalletService,
    private readonly settingsService: SettingsService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'handle_transaction:flutterwave': {
        const { transaction, payload } = job.data as {
          transaction: Transaction;
          payload: FlutterwaveChargeCompletedPayload;
        };
        await this.flutterwaveService.validateTransaction(
          payload.tx_ref,
          payload,
        );
        transaction.status = TransactionStatusEnum.COMPLETED;
        transaction.metaData = payload;
        const updatedTransaction =
          await this.transactionRepository.save(transaction);
        const walletTransaction = await this.walletService.creditWallet(
          updatedTransaction.wallet.id,
          {
            amount: updatedTransaction.amount,
            action: TransactionActionEnum.INWARD_TRANSFER,
            reference: updatedTransaction.id,
            narration:
              payload.narration ||
              `Credit to wallet ${updatedTransaction.wallet.id} via Flutterwave`,
          },
        );
        walletTransaction.transaction = updatedTransaction;
        //Send Notification to user about successful transaction
        return walletTransaction.save();
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
