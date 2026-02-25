import { Injectable } from '@nestjs/common';
import { Deposit } from './entities/deposit.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletService } from 'src/wallet/wallet.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionActionEnum } from 'src/utils/constants';

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
}
