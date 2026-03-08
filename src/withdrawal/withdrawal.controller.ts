import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { ResolveAccountDto } from './dto/resolve-account.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('withdrawal')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  async create(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @Headers('Idempotency-Key') idempotencyKey: string,
  ) {
    const data = await this.withdrawalService.create(
      createWithdrawalDto,
      idempotencyKey,
    );
    return {
      success: true,
      message: 'Withdrawal is being processed',
      data: data,
    };
  }

  @Get()
  findAll() {
    return this.withdrawalService.findAll();
  }

  @Get('banks/:walletId')
  async getBanks(@Param('walletId') walletId: string) {
    const data = await this.withdrawalService.getBanks(walletId);
    return {
      success: true,
      message: 'Banks retrieved successfully',
      data: data,
    };
  }

  @Post('resolve-account')
  async resolveAccount(@Body() resolveAccountDto: ResolveAccountDto) {
    const data = await this.withdrawalService.resolveAccount(resolveAccountDto);
    return {
      success: true,
      message: 'Account resolved successfully',
      data: data,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.withdrawalService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWithdrawalDto: UpdateWithdrawalDto,
  ) {
    return this.withdrawalService.update(+id, updateWithdrawalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.withdrawalService.remove(+id);
  }
}
