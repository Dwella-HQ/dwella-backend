import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VBA } from './entity/vba.entity';
import { Repository } from 'typeorm';
import { CreateVBADto } from '../dto/create-vba.dto';
import { SettingsService } from 'src/settings/settings.service';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class VbaService {
  constructor(
    @InjectRepository(VBA) private readonly vbaRepository: Repository<VBA>,
    private readonly settingsService: SettingsService,
  ) {}

  async createVBA(wallet: Wallet, createVbaDto: CreateVBADto) {
    const vba = this.vbaRepository.create({
      bankCode: createVbaDto.bankCode,
      accountName: createVbaDto.accountName,
      accountNumber: createVbaDto.accountNumber,
      currency: wallet.currency,
      metadata: createVbaDto.metadata,
      wallet: wallet,
    });
    return this.vbaRepository.save(vba);
  }

  async findOne(id: string) {
    const vba = await this.vbaRepository.findOne({ where: { id } });
    if (!vba) {
      throw new NotFoundException('VBA not found');
    }
    return vba;
  }

  async findAll() {
    const vbas = await this.vbaRepository.find();
    return vbas;
  }

  async getVBAByWalletId(walletId: string) {
    const vba = await this.vbaRepository.find({
      where: { wallet: { id: walletId } },
    });
    return vba;
  }

  async disableVBA(id: string) {
    const vba = await this.findOne(id);
    vba.isActive = false;
    return this.vbaRepository.save(vba);
  }
}
