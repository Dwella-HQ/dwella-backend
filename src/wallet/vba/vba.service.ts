import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VBA } from './entity/vba.entity';
import { Repository } from 'typeorm';
import { SettingsService } from 'src/settings/settings.service';
import { Wallet } from '../entities/wallet.entity';
import { AssignVBADto } from '../dto/assign-vba.dto';

@Injectable()
export class VbaService {
  constructor(
    @InjectRepository(VBA) private readonly vbaRepository: Repository<VBA>,
    private readonly settingsService: SettingsService,
  ) {}

  async assignVBA(wallet: Wallet, assignVbaDto: AssignVBADto) {
    const vba = this.vbaRepository.create({
      bankCode: assignVbaDto.bankCode,
      accountName: assignVbaDto.accountName,
      accountNumber: assignVbaDto.accountNumber,
      bankName: assignVbaDto.bankName,
      currency: wallet.currency,
      metadata: assignVbaDto.metadata,
      wallet: wallet,
      provider: assignVbaDto.provider,
    });
    const savedVba = await this.vbaRepository.save(vba);
    return savedVba;
  }

  async findOne(id: string) {
    const vba = await this.vbaRepository.findOne({
      where: { id },
      relations: {
        wallet: true,
      },
    });
    if (!vba) {
      throw new NotFoundException('VBA not found');
    }
    return vba;
  }

  async findByAccountNumber(accountNumber: string) {
    const vba = await this.vbaRepository.findOne({
      where: { accountNumber },
      relations: { wallet: true },
    });
    if (!vba) {
      throw new NotFoundException('VBA not found');
    }
    return vba;
  }

  async findAll() {
    const vbas = await this.vbaRepository.find();
    return vbas;
  }

  async getVBAsByWalletId(walletId: string) {
    const vbas = await this.vbaRepository.find({
      where: { wallet: { id: walletId } },
    });
    return vbas;
  }

  async disableVBA(id: string) {
    const vba = await this.findOne(id);
    vba.isActive = false;
    return this.vbaRepository.save(vba);
  }
}
