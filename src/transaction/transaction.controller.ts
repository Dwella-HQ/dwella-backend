import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
  Render,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { WalletService } from 'src/wallet/wallet.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
// import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
// import { PERMISSIONS } from 'src/utils/constants';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
// @RequirePermissions(PERMISSIONS.MANAGE_TRANSACTIONS)
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  // @Post('debit/:walletId')
  // async createDebit(
  //   @Param('walletId') walletId: string,
  //   @Body() createDebitTransactionDto: CreateDebitTransactionDto,
  // ) {
  //   const data = await this.transactionService.createDebit(
  //     createDebitTransactionDto,
  //   );
  //   return {
  //     success: true,
  //     message: 'Debit transaction created successfully',
  //     data,
  //   };
  // }

  // @Post('credit/:walletId')
  // async createCredit(
  //   @Param('walletId') walletId: string,
  //   @Body() createCreditTransactionDto: CreateCreditTransactionDto,
  // ) {
  //   const wallet = await this.walletService.findOne(walletId);
  //   const data = await this.transactionService.createCredit(
  //     wallet,
  //     createCreditTransactionDto,
  //   );
  //   return {
  //     success: true,
  //     message: 'Credit transaction created successfully',
  //     data,
  //   };
  // }

  @Get()
  async findAll() {
    const data = await this.transactionService.findAll();
    return {
      success: true,
      message: 'Transactions retrieved successfully',
      data,
    };
  }

  // @Get('wallet/:walletId')
  // async findWalletTransactions(@Param('walletId') walletId: string) {
  //   const data = await this.transactionService.findWalletTransactions(walletId);
  //   return {
  //     success: true,
  //     message: 'Wallet transactions retrieved successfully',
  //     data,
  //   };
  // }

  @Public()
  @Render('transaction-success')
  @Get('success')
  transactionSuccess(@Query('amount') amount: string) {
    return { amount };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.transactionService.findOne(id);
    return {
      success: true,
      message: 'Transaction retrieved successfully',
      data,
    };
  }

  // @Patch(':id/status')
  // async updateStatus(
  //   @Param('id') id: string,
  //   @Body() updateData: UpdateTransactionStatusDto,
  // ) {
  //   return this.transactionService.updateTransactionStatus(
  //     id,
  //     updateData.transactionStatus,
  //     updateData.metaData,
  //   );
  // }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.transactionService.remove(id);
    return {
      success: true,
      message: 'Transaction deleted successfully',
    };
  }
}
