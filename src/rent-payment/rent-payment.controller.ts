import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RentPaymentService } from './rent-payment.service';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { UpdateRentPaymentDto } from './dto/update-rent-payment.dto';

@Controller('rent-payment')
export class RentPaymentController {
  constructor(private readonly rentPaymentService: RentPaymentService) {}

  @Post()
  create(@Body() createRentPaymentDto: CreateRentPaymentDto) {
    return this.rentPaymentService.create(createRentPaymentDto);
  }

  @Get()
  findAll() {
    return this.rentPaymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentPaymentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRentPaymentDto: UpdateRentPaymentDto,
  ) {
    return this.rentPaymentService.update(+id, updateRentPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentPaymentService.remove(+id);
  }
}
