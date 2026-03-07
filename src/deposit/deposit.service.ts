import { Injectable, NotFoundException } from '@nestjs/common';
import { Deposit } from './entities/deposit.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletService } from 'src/wallet/wallet.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  TransactionActionEnum,
  TransactionStatusEnum,
} from 'src/utils/constants';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(createDepositDto: CreateDepositDto) {
    const wallet = await this.walletService.findOne(createDepositDto.walletId);
    const deposit = this.depositRepository.create({
      wallet: wallet,
      amount: createDepositDto.amount,
      currency: wallet.currency,
      narration: createDepositDto.narration,
    });
    const transaction = await this.transactionService.createCredit({
      amount: createDepositDto.amount,
      currency: wallet.currency,
      narration: createDepositDto.narration,
      action: TransactionActionEnum.DEPOSIT,
      senderDetails: {
        fullName: wallet.landlord.user.fullName,
        email: wallet.landlord.user.email,
      },
      walletId: wallet.id,
    });
    deposit.transaction = transaction;
    deposit.reference = transaction.id;
    const savedDeposit = await this.depositRepository.save(deposit);
    return savedDeposit;
  }

  async findAll() {
    const deposits = await this.depositRepository.find({
      relations: { walletTransaction: true, transaction: true },
    });
    return deposits;
  }

  async findOne(id: string) {
    const deposit = await this.depositRepository.findOne({
      where: { id },
      relations: { wallet: true, walletTransaction: true, transaction: true },
      relationLoadStrategy: 'query',
    });
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }
    return deposit;
  }

  async getDepositByReference(reference: string) {
    const deposit = await this.depositRepository.findOne({
      where: { reference },
      relations: { wallet: true, walletTransaction: true, transaction: true },
      relationLoadStrategy: 'query',
    });
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }
    return deposit;
  }

  async getDepositByWalletTransactionId(walletTransactionId: string) {
    const deposit = await this.depositRepository.findOne({
      where: { walletTransaction: { id: walletTransactionId } },
      relations: { wallet: true, walletTransaction: true, transaction: true },
      relationLoadStrategy: 'query',
    });
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }
    return deposit;
  }

  async getWalletDeposits(walletId: string) {
    const deposits = await this.depositRepository.find({
      where: { wallet: { id: walletId } },
      relations: { wallet: true, walletTransaction: true, transaction: true },
      relationLoadStrategy: 'query',
    });
    return deposits;
  }

  async confirmDeposit(reference: string, transaction: Transaction) {
    const deposit = await this.getDepositByReference(reference);
    if (deposit.status === TransactionStatusEnum.COMPLETED) {
      throw new NotFoundException('Deposit already confirmed');
    }
    deposit.status = TransactionStatusEnum.COMPLETED;
    deposit.transaction = transaction;
    deposit.paymentMethod = transaction.paymentMethod;
    deposit.senderDetails = transaction.senderDetails;
    const savedDeposit = await this.depositRepository.save(deposit);
    const walletTransaction = await this.walletService.creditWallet(
      deposit.wallet.id,
      {
        amount: deposit.amount,
        description: `Deposit of ${deposit.amount} from ${deposit.senderDetails.fullName}`,
        reference: deposit.reference,
        action: TransactionActionEnum.DEPOSIT,
      },
    );
    savedDeposit.walletTransaction = walletTransaction;
    return this.depositRepository.save(savedDeposit);
  }

  async createAndConfirmDeposit(transaction: Transaction) {
    const deposit = this.depositRepository.create({
      wallet: transaction.wallet,
      amount: transaction.amount,
      currency: transaction.currency,
      narration: transaction.narration,
      transaction: transaction,
      reference: transaction.id,
      status: TransactionStatusEnum.COMPLETED,
      senderDetails: transaction.senderDetails,
      paymentMethod: transaction.paymentMethod,
    });
    const savedDeposit = await this.depositRepository.save(deposit);
    const walletTransaction = await this.walletService.creditWallet(
      deposit.wallet.id,
      {
        amount: deposit.amount,
        description: `Deposit of ${deposit.amount} from ${deposit.senderDetails.fullName}`,
        reference: deposit.reference,
        action: TransactionActionEnum.DEPOSIT,
      },
    );
    deposit.walletTransaction = walletTransaction;
    return savedDeposit;
  }
}
