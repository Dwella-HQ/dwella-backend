import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLandlordWalletDto } from './dto/create-wallet.dto';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LandlordService } from 'src/landlord/landlord.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly landlordService: LandlordService,
  ) {}

  async createLandlordWallet(createWalletDto: CreateLandlordWalletDto) {
    const landlord = await this.landlordService.findOne(
      createWalletDto.landlordId,
    );
    const wallet = this.walletRepository.create({
      landlord: landlord,
      currency: createWalletDto.currency,
    });
    return this.walletRepository.save(wallet);
  }

  async findAll() {
    const wallets = await this.walletRepository.find();
    return wallets;
  }

  async findOne(id: string) {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async creditWallet(walletId: string, amount: number) {
    const wallet = await this.findOne(walletId);
    wallet.balance += amount;
    wallet.escrowBalance = wallet.balance;
    return this.walletRepository.save(wallet);
  }

  async debitWallet(walletId: string, amount: number) {
    const wallet = await this.findOne(walletId);
    if (wallet.balance < amount) {
      throw new NotFoundException('Insufficient balance');
    }
    wallet.balance -= amount;
    wallet.escrowBalance = wallet.balance;
    return this.walletRepository.save(wallet);
  }

  // async creditEscrow(walletId: string, amount: number) {
  //   const wallet = await this.findOne(walletId);
  //   wallet.escrowBalance += amount;
  //   return this.walletRepository.save(wallet);
  // }

  // async debitEscrow(walletId: string, amount: number) {
  //   const wallet = await this.findOne(walletId);
  //   if (wallet.escrowBalance < amount) {
  //     throw new NotFoundException('Insufficient escrow balance');
  //   }
  //   wallet.escrowBalance -= amount;
  //   return this.walletRepository.save(wallet);
  // }

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
