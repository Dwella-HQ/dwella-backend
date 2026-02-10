/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyManagerDto } from './dto/create-property-manager.dto';
import { UpdatePropertyManagerDto } from './dto/update-property-manager.dto';
import { PropertyManager } from './entities/property-manager.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { AddressService } from 'src/address/address.service';
import { LandlordService } from 'src/landlord/landlord.service';
import { AddLandlordDto } from './dto/add-landlord.dto';
import { RemoveLandlordDto } from './dto/remove-landlord.dto';

@Injectable()
export class PropertyManagerService {
  constructor(
    @InjectRepository(PropertyManager)
    private propertyManagerRepository: Repository<PropertyManager>,
    private userService: UserService,
    private addressService: AddressService,
    private landlordService: LandlordService,
  ) {}
  async create(createPropertyManagerDto: CreatePropertyManagerDto) {
    const user = await this.userService.findOne(
      createPropertyManagerDto.userId,
    );
    const address = await this.addressService.create(
      user.id,
      createPropertyManagerDto.address,
    );
    const propertyManager = this.propertyManagerRepository.create({
      user: user,
      address: address,
    });
    return this.propertyManagerRepository.save(propertyManager);
  }

  async findAll() {
    const propertyManagers = await this.propertyManagerRepository.find({
      relations: {
        user: true,
        landlords: true,
      },
    });
    return propertyManagers;
  }

  async findOne(id: string) {
    const propertyManager = await this.propertyManagerRepository.findOne({
      where: { id },
      relations: {
        user: true,
        landlords: true,
      },
    });
    if (!propertyManager) {
      throw new NotFoundException('Property Manager not found');
    }
    return propertyManager;
  }

  async update(id: string, updatePropertyManagerDto: UpdatePropertyManagerDto) {
    const propertyManager = await this.findOne(id);
    for (const key in updatePropertyManagerDto) {
      if (updatePropertyManagerDto[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        propertyManager[key] = updatePropertyManagerDto[key];
      }
    }
    return this.propertyManagerRepository.save(propertyManager);
  }

  async addLandlord(propertyManagerId: string, addLandlordDto: AddLandlordDto) {
    const propertyManager = await this.findOne(propertyManagerId);
    const landlord = await this.landlordService.findOne(
      addLandlordDto.landlordId,
    );
    propertyManager.landlords.push(landlord);
    return this.propertyManagerRepository.save(propertyManager);
  }

  async removeLandlord(
    propertyManagerId: string,
    removeLandlordDto: RemoveLandlordDto,
  ) {
    const propertyManager = await this.findOne(propertyManagerId);
    const landlord = await this.landlordService.findOne(
      removeLandlordDto.landlordId,
    );
    propertyManager.landlords = propertyManager.landlords.filter(
      (l) => l.id !== landlord.id,
    );
    return this.propertyManagerRepository.save(propertyManager);
  }

  async remove(id: string) {
    const result = await this.propertyManagerRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Property Manager not found');
    }
    return true;
  }
}
