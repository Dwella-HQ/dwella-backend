import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateCreditTransactionDto,
  CreateDebitTransactionDto,
} from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
  PaymentProviderEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/utils/constants';
import { MonnifyService } from 'src/services/monnify/monnify.service';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private settingsService: SettingsService,
    private paystackService: PaystackService,
    private flutterwaveService: FlutterwaveService,
    private monnifyService: MonnifyService,
  ) {}

  async createDebit(
    wallet: Wallet,
    createDebitTransactionDto: CreateDebitTransactionDto,
  ) {
    const transaction = this.transactionRepository.create({
      ...createDebitTransactionDto,
      transactionType: TransactionTypeEnum.DEBIT,
      wallet: wallet,
    });
    return await this.transactionRepository.save(transaction);
  }

  async createCredit(
    wallet: Wallet,
    createCreditTransactionDto: CreateCreditTransactionDto,
  ) {
    const provider = (await this.settingsService.getSetting(
      'preferredPaymentProvider',
    )) as PaymentProviderEnum;
    const transaction = await this.transactionRepository.save({
      ...createCreditTransactionDto,
      provider: provider,
      currency: wallet.currency,
      senderDetails: {
        email: 'johnsonolaolu@gmail.com',
        fullName: 'Olalekan Johnson',
      },
      narration: `Credit to wallet ${wallet.id}`,
      transactionType: TransactionTypeEnum.CREDIT,
      wallet: wallet,
    });

    // if (provider === PaymentProviderEnum.PAYSTACK) {
    //   const response =
    //     await this.paystackService.initiateWalletCredit(transaction);
    // }
    // if (provider === PaymentProviderEnum.FLUTTERWAVE) {
    //   const response =
    //     await this.flutterwaveService.initiateWalletCredit(transaction);
    // }
    if (provider === PaymentProviderEnum.MONNIFY) {
      const response =
        await this.monnifyService.initiateWalletCredit(transaction);
      transaction.paymentUrl = response.responseBody.checkoutUrl;
    }
    return await this.transactionRepository.save(transaction);
  }

  async findAll() {
    const transactions = await this.transactionRepository.find();
    return transactions;
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: {
        wallet: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async findWalletTransactions(walletId: string) {
    const transactions = await this.transactionRepository.find({
      where: { wallet: { id: walletId } },
      relations: {
        wallet: true,
      },
    });
    return transactions;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatusEnum,
    metaData?: Record<string, any>,
  ) {
    const transaction = await this.findOne(transactionId);
    transaction.transactionStatus = status;
    transaction.metaData = metaData;
    return await this.transactionRepository.save(transaction);
  }

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
