import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaintenanceRequestTypeDto } from './dto/create-maintenance-request-type.dto';
import { UpdateMaintenanceRequestTypeDto } from './dto/update-maintenance-request-subtype.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaintenanceRequestType } from './entities/maintenance-request-type.entity';
import { Repository } from 'typeorm';
import { MaintenanceRequestSubType } from './entities/maintenance-request-subtypes.entity';
import { CreateMaintenanceRequestSubTypeDto } from './dto/create-maintenance-request-subtype.dto';
import { UpdateMaintenanceRequestSubTypeDto } from './dto/update-maintenance-request-type.dto';

@Injectable()
export class MaintenanceRequestTypesService {
  constructor(
    @InjectRepository(MaintenanceRequestType)
    private maintenanceRequestTypeRepository: Repository<MaintenanceRequestType>,

    @InjectRepository(MaintenanceRequestSubType)
    private maintenanceRequestSubTypeRepository: Repository<MaintenanceRequestSubType>,
  ) {}

  async create(
    createMaintenanceRequestTypeDto: CreateMaintenanceRequestTypeDto,
  ) {
    const maintenanceRequestType = this.maintenanceRequestTypeRepository.create(
      createMaintenanceRequestTypeDto,
    );
    return await this.maintenanceRequestTypeRepository.save(
      maintenanceRequestType,
    );
  }

  async findAll() {
    const maintenanceRequestTypes =
      await this.maintenanceRequestTypeRepository.find({
        relations: ['subTypes'],
      });
    return maintenanceRequestTypes;
  }

  async findOne(id: string) {
    const maintenanceRequestType =
      await this.maintenanceRequestTypeRepository.findOne({
        where: { id },
        relations: ['subTypes'],
      });
    if (!maintenanceRequestType) {
      throw new NotFoundException(`MaintenanceRequestTypenot found`);
    }
    return maintenanceRequestType;
  }

  async findOneByName(name: string) {
    const maintenanceRequestType =
      await this.maintenanceRequestTypeRepository.findOne({
        where: { name },
        relations: ['subTypes'],
      });
    if (!maintenanceRequestType) {
      throw new NotFoundException(`MaintenanceRequestType not found`);
    }
    return maintenanceRequestType;
  }

  async addSubType(
    typeId: string,
    createMaintenanceRequestSubTypeDto: CreateMaintenanceRequestSubTypeDto,
  ) {
    const maintenanceRequestType = await this.findOne(typeId);
    const subType = this.maintenanceRequestSubTypeRepository.create({
      ...createMaintenanceRequestSubTypeDto,
      type: maintenanceRequestType,
    });
    return await this.maintenanceRequestSubTypeRepository.save(subType);
  }

  async getSubTypes(typeId: string) {
    const maintenanceRequestType = await this.findOne(typeId);
    const subtypes = await this.maintenanceRequestSubTypeRepository.find({
      where: { type: maintenanceRequestType },
    });
    return subtypes;
  }

  async getSubTypesByName(name: string) {
    const maintenanceSubType =
      await this.maintenanceRequestSubTypeRepository.findOne({
        where: { name },
        relations: ['type'],
      });
    if (!maintenanceSubType) {
      throw new NotFoundException(`MaintenanceRequestSubType not found`);
    }
    return maintenanceSubType;
  }

  async updateSubType(
    subTypeId: string,
    updateMaintenanceRequestSubTypeDto: UpdateMaintenanceRequestSubTypeDto,
  ) {
    const subType = await this.maintenanceRequestSubTypeRepository.findOne({
      where: { id: subTypeId },
      relations: ['type'],
    });
    if (!subType) {
      throw new NotFoundException(`MaintenanceRequestSubType not found`);
    }
    Object.assign(subType, updateMaintenanceRequestSubTypeDto);
    return await this.maintenanceRequestSubTypeRepository.save(subType);
  }

  async deleteSubType(subTypeId: string) {
    const result =
      await this.maintenanceRequestSubTypeRepository.delete(subTypeId);
    if (result.affected === 0) {
      throw new NotFoundException(`MaintenanceRequestSubType not found`);
    }
    return true;
  }

  async update(
    id: string,
    updateMaintenanceRequestTypeDto: UpdateMaintenanceRequestTypeDto,
  ) {
    const maintenanceRequestType = await this.findOne(id);
    Object.assign(maintenanceRequestType, updateMaintenanceRequestTypeDto);
    return await this.maintenanceRequestTypeRepository.save(
      maintenanceRequestType,
    );
  }

  async remove(id: string) {
    const result = await this.maintenanceRequestTypeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`MaintenanceRequestType not found`);
    }
    return true;
  }
}
