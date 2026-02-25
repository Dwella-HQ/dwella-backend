import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
  // This is just a placeholder implementation. You can modify it to accept a DTO with the necessary data for creating a deposit.}}
}
