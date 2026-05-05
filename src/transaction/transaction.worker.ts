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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VbaService } from 'src/wallet/vba/vba.service';
import { DepositService } from 'src/deposit/deposit.service';
import { WithdrawalService } from 'src/withdrawal/withdrawal.service';
import { RentPaymentService } from 'src/rent-payment/rent-payment.service';

@Processor(JOB_NAMES.HANDLE_TRANSACTION_JOB)
export class TransactionWorker extends WorkerHost {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly monnifyService: MonnifyService,
    private readonly walletService: WalletService,
    private readonly vbaService: VbaService,
    private readonly settingsService: SettingsService,
    private readonly depositService: DepositService,
    private readonly withdrawalService: WithdrawalService,
    private readonly rentPaymentService: RentPaymentService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'handle_transaction_credit_success': {
        const { transactionId, metadata, paymentMethod } = job.data as {
          transactionId: string;
          paymentMethod: PaymentMethodEnum;
          metadata?: Record<string, any>;
        };
        const transaction = await this.transactionRepository.findOne({
          where: { id: transactionId },
        });
        if (!transaction) {
          throw new Error('Transaction not found');
        }
        transaction.status = TransactionStatusEnum.COMPLETED;
        transaction.paymentMethod = paymentMethod;
        transaction.metaData = metadata;
        await this.transactionRepository.save(transaction);
        if (transaction?.action === TransactionActionEnum.DEPOSIT) {
          const deposit = await this.depositService.confirmDeposit(
            transaction.id,
            transaction,
          );
          return deposit;
        }
        if (transaction?.action === TransactionActionEnum.RENT_PAYMENT) {
          const rentPayment = await this.rentPaymentService.confirmRentPayment(
            transaction.id,
            transaction,
          );
          return rentPayment;
        }
        return;
      }
      case 'handle_vba_transaction_credit_success': {
        const { accountNumber, amount, narration, provider, metadata } =
          job.data as {
            accountNumber: string;
            amount: number;
            narration?: string;
            provider: PaymentProviderEnum;
            metadata?: Record<string, any>;
          };
        const vba = await this.vbaService.findByAccountNumber(accountNumber);
        const transaction = this.transactionRepository.create({
          walletId: vba.wallet.id,
          provider: provider,
          action: TransactionActionEnum.DEPOSIT,
          currency: vba.wallet.currency,
          amount,
          narration: narration || `Deposit to VBA ${accountNumber}`,
          type: TransactionTypeEnum.CREDIT,
          status: TransactionStatusEnum.COMPLETED,
          paymentMethod: PaymentMethodEnum.BANK_TRANSFER,
          senderDetails: {
            fullName: vba.accountName,
            accountNumber: vba.accountNumber,
          },
          metaData: metadata,
        });
        const savedTransaction =
          await this.transactionRepository.save(transaction);
        const deposit =
          await this.depositService.createAndConfirmDeposit(savedTransaction);
        return deposit;
      }
      case 'handle_transaction_debit_success': {
        const { transactionId, metadata } = job.data as {
          transactionId: string;
          metadata?: Record<string, any>;
        };
        const transaction = await this.transactionRepository.findOne({
          where: { id: transactionId },
        });
        if (!transaction) {
          throw new Error('Transaction not found');
        }
        transaction.status = TransactionStatusEnum.COMPLETED;
        transaction.metaData = metadata;
        await this.transactionRepository.save(transaction);
        if (transaction?.action === TransactionActionEnum.WITHDRAWAL) {
          const withdrawal = await this.withdrawalService.confirmWithdrawal(
            transaction.id,
            transaction,
          );
          return withdrawal;
        }
        return;
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
