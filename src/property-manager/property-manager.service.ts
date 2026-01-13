/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreatePropertyManagerDto } from './dto/create-property-manager.dto';
import { UpdatePropertyManagerDto } from './dto/update-property-manager.dto';

@Injectable()
export class PropertyManagerService {
  create(createPropertyManagerDto: CreatePropertyManagerDto) {
    return 'This action adds a new propertyManager';
  }

  findAll() {
    return `This action returns all propertyManager`;
  }

  findOne(id: number) {
    return `This action returns a #${id} propertyManager`;
  }

  update(id: number, updatePropertyManagerDto: UpdatePropertyManagerDto) {
    return `This action updates a #${id} propertyManager`;
  }

  remove(id: number) {
    return `This action removes a #${id} propertyManager`;
  }
}
