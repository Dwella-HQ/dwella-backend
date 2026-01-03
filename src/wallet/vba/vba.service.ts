import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VBA } from './entity/vba.entity';
import { Repository } from 'typeorm';
import { CreateVBADto } from './dto/create-vba.dto';
import { WalletService } from '../wallet.service';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class VbaService {
  constructor(
    @InjectRepository(VBA) private readonly vbaRepository: Repository<VBA>,
    private readonly walletService: WalletService,
    private readonly settingsService: SettingsService,
  ) {}

  async createVBA(createVbaDto: CreateVBADto) {
    const wallet = await this.walletService.findOne(createVbaDto.walletId);
    const vba = this.vbaRepository.create({
      bankCode: createVbaDto.bankCode,
      accountName: createVbaDto.accountName,
      accountNumber: createVbaDto.accountNumber,
      currency: createVbaDto.currency,
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
