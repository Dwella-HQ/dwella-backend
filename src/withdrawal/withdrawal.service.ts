/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { PaystackService } from 'src/services/paystack/paystack.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { WalletService } from 'src/wallet/wallet.service';
import ms from 'ms';
import { SettingsService } from 'src/settings/settings.service';
import {
  CurrenciesEnum,
  JOB_NAMES,
  PaymentProviderEnum,
  TransactionActionEnum,
  TransactionStatusEnum,
} from 'src/utils/constants';
import { ResolveAccountDto } from './dto/resolve-account.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly walletService: WalletService,
    private readonly paystackService: PaystackService,
    private readonly settingsService: SettingsService,
    @InjectQueue(JOB_NAMES.WITHDRAWAL_TRANSFER_JOB)
    private readonly withdrawalQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createWithdrawalDto: CreateWithdrawalDto,
    idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    const key = `withdrawal:${idempotencyKey}`;
    const pendingWithdrawal = await this.cacheManager.get(key);
    if (pendingWithdrawal) {
      return 'A withdrawal with the same idempotency key is already being processed';
    }
    await this.cacheManager.set(key, { status: 'pending' }, ms('10m') / 1000);
    const wallet = await this.walletService.findOne(
      createWithdrawalDto.walletId,
    );
    if (wallet.balance < createWithdrawalDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }
    if (
      !createWithdrawalDto.recipientDetails.bankCode ||
      !createWithdrawalDto.recipientDetails.accountNumber
    ) {
      throw new BadRequestException('Recipient bank details are required');
    }
    await this.withdrawalQueue.add('process-withdrawal', createWithdrawalDto, {
      jobId: idempotencyKey,
    });
    await this.cacheManager.del(key);
  }

  findAll() {
    return `This action returns all withdrawal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} withdrawal`;
  }

  update(id: number, updateWithdrawalDto: UpdateWithdrawalDto) {
    return `This action updates a #${id} withdrawal`;
  }

  remove(id: number) {
    return `This action removes a #${id} withdrawal`;
  }

  async getBanksByWallet(walletId: string) {
    const provider = (await this.settingsService.getSetting(
      'preferredPaymentProvider',
    )) as PaymentProviderEnum;

    const wallet = await this.walletService.findOne(walletId);
    const key = `bank:${wallet.currency}`;
    const cachedBanks = await this.cacheManager.get(key);
    if (cachedBanks) {
      return cachedBanks;
    }
    const banks: { name: string; bankCode: string }[] = [];
    if (provider === PaymentProviderEnum.PAYSTACK) {
      const paystackBanks = await this.paystackService.listBanks(
        wallet.currency,
      );
      for (const bank of paystackBanks) {
        banks.push({ name: bank.name, bankCode: bank.code });
      }
    }
    await this.cacheManager.set(key, banks, ms('1h') / 1000);
    return banks;
  }

  async getBanks(currency: CurrenciesEnum = CurrenciesEnum.NGN) {
    const provider = (await this.settingsService.getSetting(
      'preferredPaymentProvider',
    )) as PaymentProviderEnum;
    const key = `bank:${currency}`;
    const cachedBanks = await this.cacheManager.get(key);
    if (cachedBanks) {
      return cachedBanks;
    }
    const banks: { name: string; bankCode: string }[] = [];
    if (provider === PaymentProviderEnum.PAYSTACK) {
      const paystackBanks = await this.paystackService.listBanks(currency);
      for (const bank of paystackBanks) {
        banks.push({ name: bank.name, bankCode: bank.code });
      }
    }
    await this.cacheManager.set(key, banks, ms('1h') / 1000);
    return banks;
  }

  async resolveAccount(resolveAccountDto: ResolveAccountDto) {
    const provider = (await this.settingsService.getSetting(
      'preferredPaymentProvider',
    )) as PaymentProviderEnum;

    if (provider === PaymentProviderEnum.PAYSTACK) {
      const accountName = await this.paystackService.resolveAccount(
        resolveAccountDto.accountNumber,
        resolveAccountDto.bankCode,
      );
      return accountName;
    }
    throw new InternalServerErrorException('No payment provider configured');
  }

  async confirmWithdrawal(reference: string, transaction: Transaction) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const withdrawal = await queryRunner.manager.findOne(Withdrawal, {
        where: { reference },
        relations: ['wallet'],
      });
      if (!withdrawal) {
        throw new NotFoundException('Withdrawal not found');
      }
      withdrawal.status = TransactionStatusEnum.COMPLETED;
      withdrawal.transaction = transaction;
      const savedWithdrawal = await queryRunner.manager.save(withdrawal);
      const walletTransaction = await this.walletService.debitWallet(
        withdrawal.wallet.id,
        {
          amount: savedWithdrawal.amount,
          narration: `Withdrawal of ${savedWithdrawal.amount} ${savedWithdrawal.currency}`,
          reference: savedWithdrawal.reference,
          action: TransactionActionEnum.WITHDRAWAL,
        },
      );
      savedWithdrawal.walletTransaction = walletTransaction;
      await queryRunner.manager.save(savedWithdrawal);
      await queryRunner.commitTransaction();
      return savedWithdrawal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
