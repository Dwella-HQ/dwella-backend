import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { RentPaymentService } from './rent-payment.service';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';

@Controller('rent-payment')
export class RentPaymentController {
  constructor(private readonly rentPaymentService: RentPaymentService) {}

  @Post()
  async create(
    @Body() createRentPaymentDto: CreateRentPaymentDto,
    @Headers('Idempotency-Key') idempotencyKey: string,
  ) {
    const data = await this.rentPaymentService.create(
      createRentPaymentDto,
      idempotencyKey,
    );
    return {
      success: true,
      message: 'Rent payment created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.rentPaymentService.findAll();
    return {
      success: true,
      message: 'Rent payments retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.rentPaymentService.findOne(id);
    return {
      success: true,
      message: 'Rent payment retrieved successfully',
      data,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentPaymentService.remove(+id);
  }
}
