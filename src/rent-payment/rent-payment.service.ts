import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RentPayment } from './entities/rent-payment.entity';
import { DataSource, Repository } from 'typeorm';
import { RentService } from 'src/rent/rent.service';
import { WalletService } from 'src/wallet/wallet.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import ms from 'ms';
import {
  RentStatusEnum,
  TransactionActionEnum,
  TransactionStatusEnum,
} from 'src/utils/constants';
import { format } from 'date-fns';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Injectable()
export class RentPaymentService {
  constructor(
    @InjectRepository(RentPayment)
    private rentPaymentRepository: Repository<RentPayment>,
    private readonly rentService: RentService,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createRentPaymentDto: CreateRentPaymentDto,
    idempotencyKey: string,
  ) {
    // const rent =
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    const key = `rent-payment:${idempotencyKey}`;
    const pendingRentPayment = await this.cacheManager.get<{ status: string }>(
      key,
    );
    if (pendingRentPayment) {
      return 'A rent payment with the same idempotency key is already being processed';
    }
    await this.cacheManager.set(key, { status: 'pending' }, ms('10m') / 1000);
    const existingRentPayment = await this.rentPaymentRepository.findOne({
      where: { indempotencyKey: idempotencyKey },
    });
    if (existingRentPayment) {
      return existingRentPayment;
    }
    const rent = await this.rentService.findOne(createRentPaymentDto.rentId);
    if (rent.status === RentStatusEnum.PAID) {
      throw new BadRequestException('Rent is already paid');
    }
    const wallet = await this.walletService.findWalletForLease(rent.lease.id);
    const rentPayment = this.rentPaymentRepository.create({
      wallet: wallet,
      rent: rent,
      totalAmount: rent.totalAmount,
      lateFee: rent.lateFee,
      amount: rent.amount,
      currency: wallet.currency,
      narration: `Rent payment for ${rent.lease.unit.name} from ${format(rent.startDate, 'do MMMM yyyy')} to ${format(rent.endDate, 'do MMMM yyyy')}`,
      indempotencyKey: idempotencyKey,
    });
    const transaction = await this.transactionService.createCredit({
      amount: rent.totalAmount,
      currency: wallet.currency,
      narration: rentPayment.narration,
      action: TransactionActionEnum.RENT_PAYMENT,
      senderDetails: {
        fullName: rent.lease.tenant.user.fullName,
        email: rent.lease.tenant.user.email,
      },
      walletId: wallet.id,
    });
    rentPayment.transaction = transaction;
    rentPayment.reference = transaction.id;
    const savedRentPayment = await this.rentPaymentRepository.save(rentPayment);
    await this.cacheManager.del(key);
    return savedRentPayment;
  }

  async findAll() {
    const rentPayments = await this.rentPaymentRepository.find({
      relations: { wallet: true, rent: true, transaction: true },
    });
    return rentPayments;
  }

  async findOne(id: string) {
    const rentPayment = await this.rentPaymentRepository.findOne({
      where: { id },
      relations: { wallet: true, rent: true, transaction: true },
    });
    if (!rentPayment) {
      throw new NotFoundException('Rent payment not found');
    }
    return rentPayment;
  }

  async findOneByReference(reference: string) {
    const rentPayment = await this.rentPaymentRepository.findOne({
      where: { reference },
      relations: { wallet: true, rent: true, transaction: true },
    });
    if (!rentPayment) {
      throw new NotFoundException('Rent payment not found');
    }
    return rentPayment;
  }

  async findOneByWalletTransactionId(walletTransactionId: string) {
    const rentPayment = await this.rentPaymentRepository.findOne({
      where: { walletTransactionId },
      relations: { wallet: true, rent: true, transaction: true },
    });
    if (!rentPayment) {
      throw new NotFoundException('Rent payment not found');
    }
    return rentPayment;
  }

  async getWalletRentPayments(walletId: string) {
    const rentPayments = await this.rentPaymentRepository.find({
      where: { wallet: { id: walletId } },
      relations: { wallet: true, walletTransaction: true, transaction: true },
      relationLoadStrategy: 'query',
    });
    return rentPayments;
  }

  async confirmRentPayment(reference: string, transaction: Transaction) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const rentPayment = await queryRunner.manager.findOne(RentPayment, {
        where: { reference },
        relations: { rent: true, wallet: true, transaction: true },
      });
      if (!rentPayment) {
        throw new NotFoundException('Rent payment not found');
      }
      if (rentPayment.status === TransactionStatusEnum.COMPLETED) {
        throw new BadRequestException('Rent payment already confirmed');
      }
      rentPayment.status = TransactionStatusEnum.COMPLETED;
      rentPayment.transaction = transaction;
      rentPayment.paymentMethod = transaction.paymentMethod;
      rentPayment.narration = transaction.narration;
      rentPayment.senderDetails = transaction.senderDetails;
      const savedRentPayment = await queryRunner.manager.save(rentPayment);
      const walletTransaction = await this.walletService.creditWallet(
        rentPayment.wallet.id,
        {
          amount: rentPayment.amount,
          description: `Rent payment of ${rentPayment.amount} from ${rentPayment.senderDetails.fullName}`,
          reference: rentPayment.reference,
          action: TransactionActionEnum.RENT_PAYMENT,
        },
      );
      if (rentPayment.lateFee > 0) {
        await this.walletService.creditWallet(rentPayment.wallet.id, {
          amount: rentPayment.lateFee,
          description: `Late fee of ${rentPayment.lateFee} for rent payment from ${rentPayment.senderDetails.fullName}`,
          reference: `${rentPayment.reference}-late-fee`,
          action: TransactionActionEnum.RENT_PAYMENT_LATE_FEE,
        });
      }
      savedRentPayment.walletTransaction = walletTransaction;
      await queryRunner.manager.save(savedRentPayment);
      await queryRunner.commitTransaction();
      await this.rentService.handleRentPayment(rentPayment.rent.id);
      return savedRentPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} rentPayment`;
  }
}
