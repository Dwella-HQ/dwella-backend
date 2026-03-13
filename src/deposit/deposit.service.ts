import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Deposit } from './entities/deposit.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletService } from 'src/wallet/wallet.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  TransactionActionEnum,
  TransactionStatusEnum,
} from 'src/utils/constants';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import ms from 'ms';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createDepositDto: CreateDepositDto, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    const key = `deposit:${idempotencyKey}`;
    const pendingDeposit = await this.cacheManager.get<Deposit>(key);
    if (pendingDeposit) {
      return 'A deposit with the same idempotency key is already being processed';
    }
    await this.cacheManager.set(key, { status: 'pending' }, ms('10m') / 1000);
    const existingDeposit = await this.depositRepository.findOne({
      where: { indempotencyKey: idempotencyKey },
    });
    if (existingDeposit) {
      return existingDeposit;
    }
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
        fullName: wallet.landlord.businessName,
        email: wallet.landlord.businessEmail,
      },
      walletId: wallet.id,
    });
    deposit.transaction = transaction;
    deposit.reference = transaction.id;
    const savedDeposit = await this.depositRepository.save(deposit);
    await this.cacheManager.del(key);
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const deposit = await queryRunner.manager.findOne(Deposit, {
        where: { reference },
        relations: { wallet: true, walletTransaction: true, transaction: true },
        relationLoadStrategy: 'query',
      });
      if (!deposit) {
        throw new NotFoundException('Deposit not found');
      }
      if (deposit.status === TransactionStatusEnum.COMPLETED) {
        throw new BadRequestException('Deposit already confirmed');
      }
      deposit.status = TransactionStatusEnum.COMPLETED;
      deposit.transaction = transaction;
      deposit.paymentMethod = transaction.paymentMethod;
      deposit.narration = transaction.narration;
      deposit.senderDetails = transaction.senderDetails;
      const savedDeposit = await queryRunner.manager.save(deposit);
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
      await queryRunner.manager.save(savedDeposit);
      await queryRunner.commitTransaction();
      return savedDeposit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createAndConfirmDeposit(transaction: Transaction) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const wallet = await this.walletService.findOne(transaction.walletId);
      const deposit = this.depositRepository.create({
        wallet: wallet,
        amount: transaction.amount,
        currency: transaction.currency,
        narration: transaction.narration,
        transaction: transaction,
        reference: transaction.id,
        status: TransactionStatusEnum.COMPLETED,
        paymentMethod: transaction.paymentMethod,
        senderDetails: transaction.senderDetails,
      });
      const savedDeposit = await queryRunner.manager.save(deposit);
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
      await queryRunner.manager.save(savedDeposit);
      await queryRunner.commitTransaction();
      return savedDeposit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
