/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private readonly userService: UserService,
  ) {}
  async create(createAddressDto: CreateAddressDto) {
    const user = await this.userService.findOne(createAddressDto.userId);
    const address = this.addressRepository.create(createAddressDto);
    address.user = user;
    return await this.addressRepository.save(address);
  }

  async findAll() {
    const addresses = await this.addressRepository.find();
    return addresses;
  }

  async findOne(id: string) {
    const address = await this.addressRepository.findOneBy({ id });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async findUserAddresses(userId: string) {
    const addresses = await this.addressRepository.find({
      where: { user: { id: userId } },
    });
    return addresses;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOne(id);
    for (const key in updateAddressDto) {
      if (updateAddressDto[key] !== undefined) {
        address[key] = updateAddressDto[key];
      }
    }
    return await this.addressRepository.save(address);
  }

  async remove(id: string) {
    const result = await this.addressRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Address not found');
    }
    return true;
  }
}
