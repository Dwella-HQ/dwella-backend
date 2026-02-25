import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateLandlordWalletDto } from './dto/create-wallet.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { LandLordApprovedGuard } from 'src/landlord/guards/landlord.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateVBADto } from './dto/create-vba.dto';

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
      success: true,
      message: 'Landlord wallet created successfully',
      data: landlord,
    };
  }

  @UseGuards(LandLordApprovedGuard)
  @Post(':id/vba')
  async createVBA(@Param('id') id: string, @Body() payload: CreateVBADto) {
    const wallet = await this.walletService.createVBa(id, payload);
    return {
      success: true,
      message: 'VBA creation in progress',
      data: wallet,
    };
  }

  @Get()
  async findAll() {
    const wallets = await this.walletService.findAll();
    return {
      success: true,
      message: 'Wallets retrieved successfully',
      data: wallets,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wallet = await this.walletService.findOne(id);
    return {
      success: true,
      message: 'Wallet retrieved successfully',
      data: wallet,
    };
  }

  @Get('landlord/:landlordId')
  async getLandlordWallet(@Param('landlordId') landlordId: string) {
    const wallet = await this.walletService.getLandlordWallet(landlordId);
    return {
      success: true,
      message: 'Landlord wallet retrieved successfully',
      data: wallet,
    };
  }

  @Post(':id/disable')
  async disableWallet(@Param('id') id: string) {
    const wallet = await this.walletService.disableWallet(id);
    return {
      success: true,
      message: 'Wallet disabled successfully',
      data: wallet,
    };
  }
}
