/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { LessThan, Repository } from 'typeorm';
import { PropertyService } from 'src/property/property.service';
import { TenantService } from 'src/tenant/tenant.service';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/entities/file.entity';
import { MaintenanceRequestStatus } from 'src/utils/constants';
import { QueryMaintenanceRequestDto } from './dto/query-maintenance-request.dto';

@Injectable()
export class MaintenanceRequestService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private maintananceRequestRepository: Repository<MaintenanceRequest>,
    private readonly tenantService: TenantService,
    private readonly propertyService: PropertyService,
    private readonly fileService: FileService,
  ) {}

  async create(createMaintenanceRequestDto: CreateMaintenanceRequestDto) {
    const property = await this.propertyService.findOne(
      createMaintenanceRequestDto.propertyId,
    );
    const maintenanceRequest = this.maintananceRequestRepository.create({
      title: createMaintenanceRequestDto.title,
      description: createMaintenanceRequestDto.description,
      type: createMaintenanceRequestDto.type,
      priority: createMaintenanceRequestDto.priority,
      level: createMaintenanceRequestDto.level,
      subType: createMaintenanceRequestDto.subType,
      property,
    });
    if (createMaintenanceRequestDto.tenantId) {
      const tenant = await this.tenantService.findOne(
        createMaintenanceRequestDto.tenantId,
      );
      maintenanceRequest.tenant = tenant;
    }
    if (createMaintenanceRequestDto.unitId) {
      const unit = await this.propertyService.getUnit(
        createMaintenanceRequestDto.unitId,
      );
      maintenanceRequest.unit = unit;
    }
    if (createMaintenanceRequestDto.supportingFileIds) {
      const files: File[] = [];
      for (const fileId of createMaintenanceRequestDto.supportingFileIds) {
        const file = await this.fileService.findFileById(fileId);
        files.push(file);
      }
      maintenanceRequest.supportingFiles = files;
    }
    const savedRequest =
      await this.maintananceRequestRepository.save(maintenanceRequest);
    return savedRequest;
  }

  async findAll(queryDto: QueryPaginationDto) {
    const { limit = 10, cursor } = queryDto;
    const maintenanceRequests = await this.maintananceRequestRepository.find({
      where: cursor ? { createdAt: LessThan(cursor) } : {},
      order: { createdAt: 'DESC' },
      take: limit,
      relations: {
        property: true,
        tenant: true,
        unit: true,
        supportingFiles: true,
      },
    });
    return maintenanceRequests;
  }

  async query(queryDto: QueryMaintenanceRequestDto) {
    const queryBuilder =
      this.maintananceRequestRepository.createQueryBuilder(
        'maintenanceRequest',
      );
    queryBuilder.leftJoinAndSelect('maintenanceRequest.property', 'property');
    queryBuilder.leftJoinAndSelect('maintenanceRequest.tenant', 'tenant');
    queryBuilder.leftJoinAndSelect('maintenanceRequest.unit', 'unit');
    queryBuilder.leftJoinAndSelect(
      'maintenanceRequest.supportingFiles',
      'file',
    );

    if (queryDto.propertyId) {
      queryBuilder.andWhere('property.id = :propertyId', {
        propertyId: queryDto.propertyId,
      });
    }
    if (queryDto.tenantId) {
      queryBuilder.andWhere('tenant.id = :tenantId', {
        tenantId: queryDto.tenantId,
      });
    }
    if (queryDto.unitId) {
      queryBuilder.andWhere('unit.id = :unitId', { unitId: queryDto.unitId });
    }
    if (queryDto.status) {
      queryBuilder.andWhere('maintenanceRequest.status = :status', {
        status: queryDto.status,
      });
    }
    if (queryDto.priority) {
      queryBuilder.andWhere('maintenanceRequest.priority = :priority', {
        priority: queryDto.priority,
      });
    }
    if (queryDto.type) {
      queryBuilder.andWhere('maintenanceRequest.type = :type', {
        type: queryDto.type,
      });
    }
    if (queryDto.subType) {
      queryBuilder.andWhere('maintenanceRequest.subType = :subType', {
        subType: queryDto.subType,
      });
    }
    const { limit = 10, cursor } = queryDto;
    if (cursor) {
      queryBuilder.andWhere('maintenanceRequest.createdAt < :cursor', {
        cursor,
      });
    }
    queryBuilder.orderBy('maintenanceRequest.createdAt', 'DESC').take(limit);
    const maintenanceRequests = await queryBuilder.getMany();
    return maintenanceRequests;
  }

  async findOne(id: string) {
    const request = await this.maintananceRequestRepository.findOne({
      where: { id },
      relations: {
        property: true,
        tenant: true,
        unit: true,
        supportingFiles: true,
      },
    });
    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }
    return request;
  }

  async update(
    id: string,
    updateMaintenanceRequestDto: UpdateMaintenanceRequestDto,
  ) {
    const request = await this.findOne(id);
    for (const key in updateMaintenanceRequestDto) {
      if (updateMaintenanceRequestDto[key] == undefined) {
        continue;
      }
      request[key] = updateMaintenanceRequestDto[key];
      if (key === 'propertyId') {
        const property = await this.propertyService.findOne(
          updateMaintenanceRequestDto[key],
        );
        request.property = property;
      }
      if (key === 'tenantId') {
        const tenant = await this.tenantService.findOne(
          updateMaintenanceRequestDto[key],
        );
        request.tenant = tenant;
      }
      if (key === 'unitId') {
        const unit = await this.propertyService.getUnit(
          updateMaintenanceRequestDto[key],
        );
        request.unit = unit;
      }
    }
    return request;
  }

  async updateStatus(id: string, status: MaintenanceRequestStatus) {
    const request = await this.findOne(id);
    request.status = status as any;
    return await this.maintananceRequestRepository.save(request);
  }

  async remove(id: string) {
    const result = await this.maintananceRequestRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Maintenance request not found');
    }
    return true;
  }
}
