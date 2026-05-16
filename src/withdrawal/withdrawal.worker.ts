import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOB_NAMES, TransactionActionEnum } from 'src/utils/constants';
import { WalletService } from 'src/wallet/wallet.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from './entities/withdrawal.entity';

@Processor(JOB_NAMES.WITHDRAWAL_TRANSFER_JOB)
export class WithdrawalWorker extends WorkerHost {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'process-withdrawal': {
        const createWithdrawalDto = job.data as CreateWithdrawalDto;
        const wallet = await this.walletService.findOne(
          createWithdrawalDto.walletId,
        );
        const withdrawal = this.withdrawalRepository.create({
          wallet: wallet,
          amount: createWithdrawalDto.amount,
          currency: wallet.currency,
          narration: createWithdrawalDto.narration,
          recipientDetails: wallet.withdrawalDetails,
        });
        const transaction = await this.transactionService.createDebit({
          action: TransactionActionEnum.WITHDRAWAL,
          amount: createWithdrawalDto.amount,
          currency: wallet.currency,
          receiverDetails: wallet.withdrawalDetails,
          walletId: createWithdrawalDto.walletId,
          narration: createWithdrawalDto.narration,
        });
        withdrawal.transaction = transaction;
        withdrawal.reference = transaction.id;
        const savedWithdrawal =
          await this.withdrawalRepository.save(withdrawal);
        return savedWithdrawal;
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
