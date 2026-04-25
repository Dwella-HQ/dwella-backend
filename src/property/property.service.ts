/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { DataSource, Repository } from 'typeorm';
import { AddressService } from 'src/address/address.service';
import { LandlordService } from 'src/landlord/landlord.service';
import { QueryPropertyDto } from './dto/query-property.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { Unit } from './entities/unit.entity';
import { EmailService } from 'src/notification/email/email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileService } from 'src/file/file.service';
import { PropertySettings } from './entities/property-settings.entity';
import { UpdatePropertyGracePeriodDto } from './dto/update-property-grace-period.dto';
import { UpdatePropertyLateFeeDto } from './dto/update-property-late-fee.dto';
import * as ExcelJS from 'exceljs';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { Address } from 'src/address/entities/address.entity';
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertySettings)
    private propertySettingsRepository: Repository<PropertySettings>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    private addressService: AddressService,
    private landlordService: LandlordService,
    private emailService: EmailService,
    private fileService: FileService,
    private readonly eventEmitter: EventEmitter2,
    private dataSource: DataSource,
  ) {}

  async create(createPropertyDto: CreatePropertyDto) {
    const landlord = await this.landlordService.findOne(
      createPropertyDto.landlordId,
    );
    if (landlord.isApproved === false) {
      throw new BadRequestException('Landlord is not approved yet');
    }
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
    const propertySettings = this.propertySettingsRepository.create({
      property: savedProperty,
    });
    const landlordSettings = await this.landlordService.getLandlordSettings(
      landlord.id,
    );
    propertySettings.gracePeriodPeriods = landlordSettings.gracePeriodPeriods;
    propertySettings.lateFeeSettings = landlordSettings.lateFeeSettings;
    await this.propertySettingsRepository.save(propertySettings);
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
    queryBuilder.leftJoinAndSelect('property.address', 'address');
    queryBuilder.leftJoinAndSelect('property.landlord', 'landlord');
    queryBuilder.leftJoinAndSelect('property.units', 'unit');

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
        name: property.landlord.businessName,
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
    // if (!property.isApproved) {
    //   throw new BadRequestException('Property is not approved yet');
    // }
    const unit = this.unitRepository.create({
      ...createUnitDto,
      property,
    });
    if (createUnitDto.imageIds) {
      const files = Promise.all(
        createUnitDto.imageIds.map((id) => this.fileService.findFileById(id)),
      );
      unit.images = await files;
    }
    property.numberOfUnits += 1;
    await this.propertyRepository.save(property);
    return await this.unitRepository.save(unit);
  }

  async fetchPropertyUnits(propertyId: string) {
    const units = await this.unitRepository.find({
      where: { property: { id: propertyId } },
      relations: { tenant: true },
    });
    return units;
  }

  async getUnit(unitId: string) {
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: { property: true, tenant: true },
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

  async getPropertySettings(propertyId: string) {
    const propertySettings = await this.propertySettingsRepository.findOne({
      where: { property: { id: propertyId } },
    });
    if (!propertySettings) {
      throw new NotFoundException('Property settings not found');
    }
    return propertySettings;
  }

  async updateGracePeriod(
    propertyId: string,
    updateGracePeriodDto: UpdatePropertyGracePeriodDto,
  ) {
    const propertySettings = await this.getPropertySettings(propertyId);
    if (updateGracePeriodDto.monthlyRentGracePeriod) {
      propertySettings.gracePeriodPeriods.monthlyRentDueDateGracePeriod =
        updateGracePeriodDto.monthlyRentGracePeriod;
    }
    if (updateGracePeriodDto.quarterlyRentGracePeriod) {
      propertySettings.gracePeriodPeriods.quarterlyRentDueDateGracePeriod =
        updateGracePeriodDto.quarterlyRentGracePeriod;
    }
    if (updateGracePeriodDto.yearlyRentGracePeriod) {
      propertySettings.gracePeriodPeriods.yearlyRentDueDateGracePeriod =
        updateGracePeriodDto.yearlyRentGracePeriod;
    }

    return await this.propertySettingsRepository.save(propertySettings);
  }

  async updateLateFeeSettings(
    propertyId: string,
    updateLateFeeDto: UpdatePropertyLateFeeDto,
  ) {
    const propertySettings = await this.getPropertySettings(propertyId);
    if (updateLateFeeDto.lateFeeAmount !== undefined) {
      propertySettings.lateFeeSettings.lateFeeAmount =
        updateLateFeeDto.lateFeeAmount;
    }
    if (updateLateFeeDto.lateFeeType) {
      propertySettings.lateFeeSettings.lateFeeType =
        updateLateFeeDto.lateFeeType;
    }
    return await this.propertySettingsRepository.save(propertySettings);
  }

  async bulkUploadPropery(landlordId: string, file: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const landlord = await this.landlordService.findOne(landlordId);

      const workbook = new ExcelJS.Workbook();
      // Load file buffer
      await workbook.xlsx.load(file.buffer);

      const worksheet = workbook.worksheets[0]; // first sheet

      const data: Omit<CreatePropertyDto, 'landlordId'>[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header row
        const name = row.getCell(1).value as string;
        const numberOfUnits = parseInt((row.getCell(3).value as string) || '0');
        const parkingSpace = row.getCell(5).value == '1';
        const description = row.getCell(4).value as string;
        const yearBuilt = row.getCell(2).value as string;
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const amenities = row
          .getCell(7)
          .value?.toString()
          .split(',')
          .map((t) => t.trim());
        const address = {} as CreateAddressDto;
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const addressText = row
          .getCell(6)
          .value?.toString()
          .split(';')
          .map((prop) => prop.trim())
          .filter((prop) => prop.length > 0);

        (addressText || []).forEach((prop) => {
          // Remove optional '?' and split by ':' to get key and value
          const cleanProp = prop.replace('?', ''); // Remove '?' if present
          const [key, value] = cleanProp.split(':').map((s) => s.trim());

          if (key && value) {
            address[key] = value; // Assign key-value pair
          }
        });
        if (
          !name ||
          !numberOfUnits ||
          !yearBuilt ||
          !address.address ||
          !address.city ||
          !address.country ||
          !address.state
        ) {
          throw new BadRequestException(
            ' The data could not be uploaded due to insufficient information',
          );
        }
        data.push({
          name,
          address,
          numberOfUnits,
          parkingSpace,
          yearBuilt,
          amenities,
          description,
        });
      });
      // Bulk insert using transaction
      const savedProperties: Property[] = [];
      for (const item of data) {
        // Create and save address
        const addressEntity = queryRunner.manager.create(Address, {
          ...item.address,
          user: landlord.user, // Link to landlord's user
        });
        const savedAddress = await queryRunner.manager.save(
          Address,
          addressEntity,
        );

        // Create and save property
        const propertyEntity = queryRunner.manager.create(Property, {
          ...item,
          landlord,
          address: savedAddress,
          amenities: item.amenities || [],
        });
        const savedProperty = await queryRunner.manager.save(
          Property,
          propertyEntity,
        );

        // Create and save property settings (copy from landlord defaults)
        const landlordSettings = await this.landlordService.getLandlordSettings(
          landlord.id,
        );
        const propertySettings = queryRunner.manager.create(PropertySettings, {
          property: savedProperty,
          gracePeriodPeriods: landlordSettings.gracePeriodPeriods,
          lateFeeSettings: landlordSettings.lateFeeSettings,
        });
        await queryRunner.manager.save(PropertySettings, propertySettings);

        savedProperties.push(savedProperty);
      }

      // Commit transaction
      await queryRunner.commitTransaction();
      for (const property of savedProperties) {
        this.eventEmitter.emit('property.created', property.id);
      }
      return savedProperties;
    } catch (error: any) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.detail || 'An error occurred while creating the user',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const result = await this.propertyRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Property not found');
    }
    return true;
  }
}
