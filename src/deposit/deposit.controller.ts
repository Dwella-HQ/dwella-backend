import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post()
  async createDeposit(@Body() createDepositDto: CreateDepositDto) {
    const data = await this.depositService.create(createDepositDto);
    return {
      success: true,
      message: 'Deposit created successfully',
      data: data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.depositService.findAll();
    return {
      success: true,
      message: 'Deposits retrieved successfully',
      data: data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.depositService.findOne(id);
    return {
      success: true,
      message: 'Deposit retrieved successfully',
      data: data,
    };
  }

  @Get('reference/:reference')
  async findByReference(@Param('reference') reference: string) {
    const data = await this.depositService.getDepositByReference(reference);
    return {
      success: true,
      message: 'Deposit retrieved successfully',
      data: data,
    };
  }

  @Get('wallet-transaction/:walletTransactionId')
  async findByWalletTransactionId(
    @Param('walletTransactionId') walletTransactionId: string,
  ) {
    const data =
      await this.depositService.getDepositByWalletTransactionId(
        walletTransactionId,
      );
    return {
      success: true,
      message: 'Deposit retrieved successfully',
      data: data,
    };
  }

  @Get('wallet/:walletId')
  async findByWalletId(@Param('walletId') walletId: string) {
    const data = await this.depositService.getWalletDeposits(walletId);
    return {
      success: true,
      message: 'Deposits retrieved successfully',
      data: data,
    };
  }
  // This is just a placeholder implementation. You can modify it to accept a DTO with the necessary data for creating a deposit.}}
}
