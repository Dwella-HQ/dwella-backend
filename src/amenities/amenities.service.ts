/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Amenity } from './entities/amenity.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}
  async create(createAmenityDto: CreateAmenityDto) {
    const amenity = this.amenityRepository.create(createAmenityDto);
    return await this.amenityRepository.save(amenity);
  }

  async findAll() {
    const amenities = await this.amenityRepository.find();
    return amenities;
  }

  async findOne(id: string) {
    const amenity = await this.amenityRepository.findOneBy({ id });
    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }
    return amenity;
  }

  async findByName(name: string) {
    const amenity = await this.amenityRepository.findOneBy({ name });
    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }
    return amenity;
  }

  async update(id: string, updateAmenityDto: UpdateAmenityDto) {
    const amenity = await this.amenityRepository.findOneBy({ id });
    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }
    for (const key in updateAmenityDto) {
      if (updateAmenityDto[key] !== undefined) {
        amenity[key] = updateAmenityDto[key];
      }
    }
    return await this.amenityRepository.save(amenity);
  }

  async remove(id: string) {
    const result = await this.amenityRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Amenity not found');
    }
    return true;
  }
}
