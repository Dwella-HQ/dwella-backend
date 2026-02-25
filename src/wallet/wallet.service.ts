import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLandlordWalletDto } from './dto/create-wallet.dto';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LandlordService } from 'src/landlord/landlord.service';
import { InjectQueue } from '@nestjs/bullmq';
import {
  JOB_NAMES,
  PaymentProviderEnum,
  TransactionTypeEnum,
} from 'src/utils/constants';
import { Queue } from 'bullmq';
import { VbaService } from './vba/vba.service';
import { CreateVBADto } from './dto/create-vba.dto';
import { SettingsService } from 'src/settings/settings.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { CreditWalletDto, DebitWalletDto } from './dto/update-wallet.dto';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { AssignVBADto } from './dto/assign-vba.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly landlordService: LandlordService,
    private readonly vbaService: VbaService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly settingsService: SettingsService,
    @InjectQueue(JOB_NAMES.VBA_CREATION_JOB) private readonly vbaQueue: Queue,
  ) {}

  async createLandlordWallet(createWalletDto: CreateLandlordWalletDto) {
    const landlord = await this.landlordService.findOne(
      createWalletDto.landlordId,
    );
    const activeWallet = await this.walletRepository.findOne({
      where: {
        landlord: { id: createWalletDto.landlordId },
        isActive: true,
      },
    });
    if (activeWallet) {
      throw new BadRequestException('Landlord already has a wallet');
    }
    const wallet = this.walletRepository.create({
      landlord: landlord,
      currency: createWalletDto.currency,
    });
    const savedWallet = await this.walletRepository.save(wallet);
    return savedWallet;
  }

  async findAll() {
    const wallets = await this.walletRepository.find();
    return wallets;
  }

  async findOne(id: string) {
    const defaultProvider = await this.settingsService.getSetting(
      'preferredPaymentProvider',
    );
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: {
        vbas: true,
        landlord: true,
      },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    wallet.vba = wallet.vbas?.find(
      (vba) => vba.provider === defaultProvider && vba.isActive,
    );
    wallet.vbas = undefined;
    return wallet;
  }

  async getLandlordWallet(landlordId: string) {
    const defaultProvider = await this.settingsService.getSetting(
      'preferredPaymentProvider',
    );
    const wallet = await this.walletRepository.findOne({
      where: { landlord: { id: landlordId }, isActive: true },
      relations: {
        vbas: true,
      },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    wallet.vba = wallet.vbas?.find(
      (vba) => vba.provider === defaultProvider && vba.isActive,
    );
    wallet.vbas = undefined;
    return wallet;
  }

  async createVBa(walletId: string, payload: CreateVBADto) {
    const dedicatedProvider = await this.settingsService.getSetting(
      'preferredPaymentProvider',
    );
    const wallet = await this.findOne(walletId);
    wallet.bvn = payload.bvn;
    const savedWallet = await this.walletRepository.save(wallet);
    if (dedicatedProvider === PaymentProviderEnum.PAYSTACK) {
      await this.vbaQueue.add('create-virtual-account:paystack', wallet, {
        jobId: `create-vba-${wallet.id}`,
      });
    } else if (dedicatedProvider === PaymentProviderEnum.MONNIFY) {
      await this.vbaQueue.add('create-virtual-account:monnify', wallet, {
        jobId: `create-vba-${wallet.id}`,
      });
    } else if (dedicatedProvider === PaymentProviderEnum.FLUTTERWAVE) {
      await this.vbaQueue.add('create-virtual-account:flutterwave', wallet, {
        jobId: `create-vba-${wallet.id}`,
      });
    } else {
      throw new BadRequestException('Invalid payment provider');
    }
    return savedWallet;
  }

  async assignVba(walletId: string, payload: AssignVBADto) {
    const wallet = await this.findOne(walletId);
    const vba = await this.vbaService.assignVBA(wallet, payload);
    return vba;
  }

  async creditWallet(id: string, creditWalletDto: CreditWalletDto) {
    const wallet = await this.findOne(id);
    const walletTransaction = await this.walletTransactionRepository.save({
      amount: creditWalletDto.amount,
      preBalance: wallet.balance,
      postBalance: wallet.balance + creditWalletDto.amount,
      reference: creditWalletDto.reference,
      type: TransactionTypeEnum.CREDIT,
      action: creditWalletDto.action,
      wallet: wallet,
    });
    wallet.balance = walletTransaction.postBalance;
    await this.walletRepository.save(wallet);
    return walletTransaction;
  }

  async debitWallet(id: string, debitWalletDto: DebitWalletDto) {
    const wallet = await this.findOne(id);
    const walletTransaction = await this.walletTransactionRepository.save({
      amount: debitWalletDto.amount,
      preBalance: wallet.balance,
      postBalance: wallet.balance - debitWalletDto.amount,
      reference: debitWalletDto.reference,
      type: TransactionTypeEnum.DEBIT,
      action: debitWalletDto.action,
      wallet: wallet,
    });
    wallet.balance = walletTransaction.postBalance;
    await this.walletRepository.save(wallet);
    return walletTransaction;
  }

  // update(id: number, updateWalletDto: UpdateWalletDto) {
  //   return `This action updates a #${id} wallet`;
  // }
  async disableWallet(id: string) {
    const wallet = await this.findOne(id);
    wallet.isActive = false;
    return wallet.save();
  }

  async enableWallet(id: string) {
    const wallet = await this.findOne(id);
    wallet.isActive = true;
    return wallet.save();
  }

  // remove(id: number) {
  //   return `This action removes a #${id} wallet`;
  // }
}
