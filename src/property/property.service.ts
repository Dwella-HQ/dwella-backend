/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { Repository } from 'typeorm';
import { AddressService } from 'src/address/address.service';
import { LandlordService } from 'src/landlord/landlord.service';
import { QueryPropertyDto } from './dto/query-property.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { Unit } from './entities/units.entity';
import { EmailService } from 'src/notification/email/email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileService } from 'src/file/file.service';
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    private addressService: AddressService,
    private landlordService: LandlordService,
    private emailService: EmailService,
    private fileService: FileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async create(createPropertyDto: CreatePropertyDto) {
    const landlord = await this.landlordService.findOne(
      createPropertyDto.landlordId,
    );
    const address = await this.addressService.create(
      landlord.user.id,
      createPropertyDto.address,
    );
    const property = this.propertyRepository.create({
      ...createPropertyDto,
      landlord,
      address,
      amenities: createPropertyDto.amenities || [],
    });
    for (const photoId of createPropertyDto.photoIds || []) {
      const file = await this.fileService.findFileById(photoId);
      if (!file) {
        throw new NotFoundException(`File with id ${photoId} not found`);
      }
      property.photos = [...(property.photos || []), file];
    }
    for (const documentId of createPropertyDto.documentIds || []) {
      const file = await this.fileService.findFileById(documentId);
      if (!file) {
        throw new NotFoundException(`File with id ${documentId} not found`);
      }
      property.documents = [...(property.documents || []), file];
    }
    const savedProperty = await this.propertyRepository.save(property);
    this.eventEmitter.emit('property.created', savedProperty.id);
    return savedProperty;
  }

  async findAll() {
    const properties = await this.propertyRepository.find();
    return properties;
  }

  async findOne(id: string) {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: {
        landlord: true,
        address: true,
      },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  async query(queryPropertyDto: QueryPropertyDto) {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    if (queryPropertyDto.name) {
      queryBuilder.andWhere('property.name = :name', {
        name: queryPropertyDto.name,
      });
    }

    if (queryPropertyDto.landlordId) {
      queryBuilder.andWhere('property.landlordId = :landlordId', {
        landlordId: queryPropertyDto.landlordId,
      });
    }

    if (queryPropertyDto.city) {
      queryBuilder.andWhere('property.address.city = :city', {
        city: queryPropertyDto.city,
      });
    }

    if (queryPropertyDto.state) {
      queryBuilder.andWhere('property.address.state = :state', {
        state: queryPropertyDto.state,
      });
    }

    if (queryPropertyDto.minYearBuilt) {
      queryBuilder.andWhere('property.yearBuilt >= :minYearBuilt', {
        minYearBuilt: queryPropertyDto.minYearBuilt,
      });
    }

    if (queryPropertyDto.maxYearBuilt) {
      queryBuilder.andWhere('property.yearBuilt <= :maxYearBuilt', {
        maxYearBuilt: queryPropertyDto.maxYearBuilt,
      });
    }

    queryBuilder.leftJoinAndSelect('property.address', 'address');
    queryBuilder.leftJoinAndSelect('property.landlord', 'landlord');
    queryBuilder.leftJoinAndSelect('property.units', 'unit');

    const properties = await queryBuilder.getMany();
    return properties;
  }

  async getLandlordProperties(landlordId: string) {
    const properties = await this.propertyRepository.find({
      where: { landlord: { id: landlordId } },
      relations: { landlord: true, address: true },
    });
    return properties;
  }

  async approveProperty(id: string) {
    const property = await this.findOne(id);
    property.isApproved = true;
    await this.emailService.sendMailToUser({
      context: {
        name: property.landlord.landLordName,
        propertyLink: `${process.env.FRONTEND_URL}/landlord/dashboard/property/${property.id}`,
      },
      subject: 'Your Property Application is Approved',
      template: 'property-approved',
      user: property.landlord.user,
    });
    return await this.propertyRepository.save(property);
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.findOne(id);
    for (const key in updatePropertyDto) {
      if (updatePropertyDto[key] !== undefined) {
        property[key] = updatePropertyDto[key];
      }
    }
    return await this.propertyRepository.save(property);
  }

  async createUnit(propertyId: string, createUnitDto: CreateUnitDto) {
    const property = await this.findOne(propertyId);
    const unit = this.unitRepository.create({
      ...createUnitDto,
      property,
    });
    property.numberOfUnits += 1;
    await this.propertyRepository.save(property);
    return await this.unitRepository.save(unit);
  }

  async getUnits(propertyId: string) {
    const units = await this.unitRepository.find({
      where: { property: { id: propertyId } },
    });
    return units;
  }

  async getUnit(unitId: string) {
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: { property: true },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  async updateUnit(unitId: string, updateUnitDto: CreateUnitDto) {
    const unit = await this.getUnit(unitId);
    for (const key in updateUnitDto) {
      if (updateUnitDto[key] !== undefined) {
        unit[key] = updateUnitDto[key];
      }
    }
    return await this.unitRepository.save(unit);
  }

  async deleteUnit(unitId: string) {
    const unit = await this.getUnit(unitId);
    const property = await this.findOne(unit.property.id);
    property.numberOfUnits -= 1;
    await Promise.all([
      this.propertyRepository.save(property),
      this.unitRepository.softDelete(unitId),
    ]);
    return true;
  }

  async remove(id: string) {
    const result = await this.propertyRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Property not found');
    }
    return true;
  }
}
