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
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/utils/constants';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
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
    const transaction = this.transactionRepository.create({
      ...createCreditTransactionDto,
      transactionType: TransactionTypeEnum.CREDIT,
      wallet: wallet,
    });
    return await this.transactionRepository.save(transaction);
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
