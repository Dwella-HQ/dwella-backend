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
      case 'handle_inward_transfer:flutterwave': {
        // const { payload } = job.data as {
        //   payload: FlutterwaveChargeCompletedPayload;
        // };
        // if (
        //   payload.status !== 'successful' ||
        //   payload.payment_type !== 'bank_transfer'
        // ) {
        //   throw new Error('Transfer not successful');
        // }
        // const vba = await this.vbaService.findByAccountNumber(
        //   payload.,
        // );
        // await this.flutterwaveService.validateTransaction(
        //   payload.reference,
        //   payload,
        // );
        // const transaction = await this.transactionRepository.save({
        //   amount: payload.amount,
        //   currency: vba.wallet.currency,
        //   narration: payload.narration,
        //   paymentMethod: PaymentMethodEnum.BANK_TRANSFER,
        //   provider: PaymentProviderEnum.FLUTTERWAVE,
        //   senderDetails: {
        //     accountNumber: payload.account_number,
        //     fullName: payload.fullname,
        //     bankName: payload.bank_name,
        //     bankCode: payload.bank_code,
        //   },
        //   status: TransactionStatusEnum.COMPLETED,
        //   wallet: vba.wallet,
        //   type: TransactionTypeEnum.CREDIT,
        // });
        // transaction.status = TransactionStatusEnum.COMPLETED;
        // transaction.metaData = payload;
        // const updatedTransaction =
        //   await this.transactionRepository.save(transaction);
        // //Send Notification to user about successful transaction
        // const walletTransaction = await this.walletService.creditWallet(
        //   vba.wallet.id,
        //   {
        //     amount: updatedTransaction.amount,
        //     action: TransactionActionEnum.INWARD_TRANSFER,
        //     reference: updatedTransaction.id,
        //     narration:
        //       payload.narration ||
        //       `Credit to wallet ${updatedTransaction.wallet.id} via Flutterwave VBA`,
        //   },
        // );
        // walletTransaction.transaction = updatedTransaction;
        // await walletTransaction.save();
        // return updatedTransaction;
        return {};
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
