/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCreditTransactionDto,
  CreateDebitTransactionDto,
} from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
  JOB_NAMES,
  PaymentProviderEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/utils/constants';
import { MonnifyService } from 'src/services/monnify/monnify.service';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { SettingsService } from 'src/settings/settings.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { VbaService } from 'src/wallet/vba/vba.service';
import e from 'express';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private settingsService: SettingsService,
    @Inject(forwardRef(() => PaystackService))
    private paystackService: PaystackService,
    private flutterwaveService: FlutterwaveService,
    private monnifyService: MonnifyService,
    private readonly vbaService: VbaService,
    private readonly walletService: WalletService,
    @InjectQueue(JOB_NAMES.HANDLE_TRANSACTION_JOB)
    private readonly transactionQueue: Queue,
  ) {}

  async createCredit(createCreditTransactionDto: CreateCreditTransactionDto) {
    const provider = (await this.settingsService.getSetting(
      'preferredPaymentProvider',
    )) as PaymentProviderEnum;
    const transaction = this.transactionRepository.create({
      ...createCreditTransactionDto,
      provider: provider,
      currency: createCreditTransactionDto.currency,
      senderDetails: createCreditTransactionDto.senderDetails,
      walletId: createCreditTransactionDto.walletId,
      narration: createCreditTransactionDto.narration,
      type: TransactionTypeEnum.CREDIT,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);
    //TODO - Refactor this to use a strategy pattern instead of if else
    if (provider === PaymentProviderEnum.FLUTTERWAVE) {
      const response =
        await this.flutterwaveService.initiateWalletCredit(savedTransaction);
      savedTransaction.paymentUrl = response.data.link;
    } else if (provider === PaymentProviderEnum.MONNIFY) {
      const response =
        await this.monnifyService.initiateWalletCredit(savedTransaction);
      savedTransaction.paymentUrl = response.responseBody.checkoutUrl;
    } else if (provider === PaymentProviderEnum.PAYSTACK) {
      const response =
        await this.paystackService.initiateWalletCredit(savedTransaction);
      savedTransaction.paymentUrl = response.data.authorization_url;
    } else {
      throw new NotFoundException('No payment provider found');
    }
    return await this.transactionRepository.save(savedTransaction);
  }

  async createDebit(createDebitTransactionDto: CreateDebitTransactionDto) {
    const provider = (await this.settingsService.getSetting(
      'preferredPaymentProvider',
    )) as PaymentProviderEnum;
    const transaction = this.transactionRepository.create({
      ...createDebitTransactionDto,
      provider: provider,
      currency: createDebitTransactionDto.currency,
      receiverDetails: createDebitTransactionDto.receiverDetails,
      walletId: createDebitTransactionDto.walletId,
      narration: createDebitTransactionDto.narration,
      type: TransactionTypeEnum.DEBIT,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);
    if (provider === PaymentProviderEnum.PAYSTACK) {
      await this.paystackService.initiateWithdrawal(savedTransaction);
    }
    return savedTransaction;
  }

  async findAll() {
    const transactions = await this.transactionRepository.find();
    return transactions;
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  // async handleTransactionSuccess(
  //   reference: string,
  //   payload: any,
  //   provider?: PaymentProviderEnum,
  // ) {
  //   const transaction = await this.transactionRepository.findOne({
  //     where: { id: reference },
  //     relations: {
  //       wallet: true,
  //     },
  //   });
  //   if (transaction) {
  //     if (transaction.provider === PaymentProviderEnum.FLUTTERWAVE) {
  //       await this.transactionQueue.add('handle_transaction:flutterwave', {
  //         transaction,
  //         payload,
  //       });
  //     }
  //   }
  //   if (provider === PaymentProviderEnum.FLUTTERWAVE) {
  //     /* empty */
  //   }
  //   return true;
  // }

  // async handleVbaTransactionSuccess(
  //   vbaNumber: string,
  //   amount: number,
  //   narration?: string,
  //   metadata?: Record<string, any>,
  // ) {
  //   const vba = await this.vbaService.findByAccountNumber(vbaNumber);
  //   if (!vba) {
  //     throw new NotFoundException('VBA not found');
  //   }
  //   const transaction = await this.transactionRepository.save({
  //     amount,
  //     currency: vba.currency,
  //     type: TransactionTypeEnum.CREDIT,
  //     status: TransactionStatusEnum.PENDING,
  //     wallet: vba.wallet,
  //     provider: vba.provider,
  //     metaData: metadata,
  //     narration:
  //       narration ||
  //       `Credit to wallet ${vba.wallet.id} from VBA ${vba.accountNumber}`,
  //   });
  //   await this.transactionQueue.add('handle_transaction_credit_success', {
  //     transaction,
  //     payload: metadata,
  //   });
  //   return transaction;
  // }

  // async handleTransferSuccess(
  //   createCreditTransactionDto: CreateCreditTransactionDto,
  //   payload: any,
  // ) {
  //   // const transaction = await this.transactionRepository.save({
  //   //   amount: createCreditTransactionDto.amount,
  //   //   currency: createCreditTransactionDto.currency,
  //   //   type: TransactionTypeEnum.CREDIT
  //   // })
  //   // if ( createTransferTransactionDto.provider === PaymentProviderEnum.FLUTTERWAVE) {
  //   //   await this.flutterwaveService.validateTransaction(payload.reference, payload)
  //   // }
  // }

  // async updateTransactionStatus(
  //   transactionId: string,
  //   status: TransactionStatusEnum,
  //   metaData?: Record<string, any>,
  // ) {
  //   const transaction = await this.findOne(transactionId);
  //   transaction.status = status;
  //   transaction.metaData = metaData;
  //   return await this.transactionRepository.save(transaction);
  // }

  async remove(id: string) {
    const response = await this.transactionRepository.softDelete({
      id,
    });
    if (response.affected === 0) {
      throw new NotFoundException('Transaction not found');
    }
    return true;
  }
}
