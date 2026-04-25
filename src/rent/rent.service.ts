import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rent } from './entity/rent.entity';
import { Repository } from 'typeorm';
import { RentStatusEnum } from 'src/utils/constants';

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(Rent)
    private rentRepository: Repository<Rent>,
  ) {}

  async findOne(id: string) {
    const rent = await this.rentRepository.findOne({
      where: { id },
      relations: {
        lease: {
          unit: true,
          tenant: true,
        },
      },
      relationLoadStrategy: 'query',
    });
    if (!rent) {
      throw new NotFoundException('Rent not found');
    }
    return rent;
  }

  async findAll() {
    const rents = await this.rentRepository.find();
    return rents;
  }

  async handleRentPayment(id: string) {
    const rent = await this.findOne(id);
    rent.status = RentStatusEnum.PAID;
    await this.rentRepository.save(rent);
    return rent;
  }
}
