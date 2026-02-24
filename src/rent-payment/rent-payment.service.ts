/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { UpdateRentPaymentDto } from './dto/update-rent-payment.dto';

@Injectable()
export class RentPaymentService {
  create(createRentPaymentDto: CreateRentPaymentDto) {
    return 'This action adds a new rentPayment';
  }

  findAll() {
    return `This action returns all rentPayment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rentPayment`;
  }

  update(id: number, updateRentPaymentDto: UpdateRentPaymentDto) {
    return `This action updates a #${id} rentPayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} rentPayment`;
  }
}
