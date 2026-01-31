import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateLandlordWalletDto } from './dto/create-wallet.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { LandLordApprovedGuard } from 'src/landlord/guards/landlord.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(LandLordApprovedGuard)
  @Post('landlord')
  async createLandlord(@Body() createWalletDto: CreateLandlordWalletDto) {
    const landlord =
      await this.walletService.createLandlordWallet(createWalletDto);
    return {
      message: 'Landlord wallet created successfully',
      data: landlord,
    };
  }

  @Get()
  async findAll() {
    const wallets = await this.walletService.findAll();
    return {
      message: 'Wallets retrieved successfully',
      data: wallets,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wallet = await this.walletService.findOne(id);
    return {
      message: 'Wallet retrieved successfully',
      data: wallet,
    };
  }

  @Post(':id/disable')
  async disableWallet(@Param('id') id: string) {
    const wallet = await this.walletService.disableWallet(id);
    return {
      message: 'Wallet disabled successfully',
      data: wallet,
    };
  }
}
