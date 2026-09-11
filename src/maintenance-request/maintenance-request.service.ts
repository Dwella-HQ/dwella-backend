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
import { MaintenanceRequestTypesService } from './maintenance-request-types/maintenance-request-types.service';
import { QueryMaintenanceRequestsDto } from './dto/query-maintenance-requests.dto';
import { PropertyAccessService } from 'src/property-access/property-access.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MaintenanceRequestService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private maintananceRequestRepository: Repository<MaintenanceRequest>,
    private readonly tenantService: TenantService,
    private readonly propertyService: PropertyService,
    private readonly fileService: FileService,
    private readonly maintenanceRequestTypesService: MaintenanceRequestTypesService,
    private readonly propertyAccessService: PropertyAccessService,
  ) {}

  /** Ensure `user` can act on the maintenance request `id`. Throws 401. */
  private async assertRequestAccess(user: User, id: string) {
    const request = await this.findOne(id);
    await this.propertyAccessService.assertProperty(user, request.property.id);
    return request;
  }

  async create(
    createMaintenanceRequestDto: CreateMaintenanceRequestDto,
    user: User,
  ) {
    const property = await this.propertyService.findOne(
      createMaintenanceRequestDto.propertyId,
    );
    await this.propertyAccessService.assertProperty(user, property.id);
    const type = await this.maintenanceRequestTypesService.findOneByName(
      createMaintenanceRequestDto.type,
    );
    const maintenanceRequest = this.maintananceRequestRepository.create({
      title: createMaintenanceRequestDto.title,
      description: createMaintenanceRequestDto.description,
      type,
      priority: createMaintenanceRequestDto.priority,
      level: createMaintenanceRequestDto.level,
      property,
    });
    if (createMaintenanceRequestDto.subType) {
      const subType =
        await this.maintenanceRequestTypesService.getSubTypesByName(
          createMaintenanceRequestDto.subType,
        );
      maintenanceRequest.subType = subType;
    }
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

  async findOneScoped(id: string, user: User) {
    return this.assertRequestAccess(user, id);
  }

  async update(
    id: string,
    updateMaintenanceRequestDto: UpdateMaintenanceRequestDto,
    user: User,
  ) {
    const request = await this.assertRequestAccess(user, id);
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

  async updateStatus(id: string, status: MaintenanceRequestStatus, user: User) {
    const request = await this.assertRequestAccess(user, id);
    request.status = status as any;
    return await this.maintananceRequestRepository.save(request);
  }

  async remove(id: string, user: User) {
    await this.assertRequestAccess(user, id);
    const result = await this.maintananceRequestRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Maintenance request not found');
    }
    return true;
  }

  async queryMaintenanceRequests(
    query: QueryMaintenanceRequestsDto,
    user: User,
  ) {
    const accessiblePropertyIds =
      await this.propertyAccessService.getAccessiblePropertyIds(user);
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

    if (accessiblePropertyIds !== 'all') {
      if (accessiblePropertyIds.length === 0) return [];
      queryBuilder.andWhere('property.id IN (:...accessiblePropertyIds)', {
        accessiblePropertyIds,
      });
    }
    if (query.propertyId) {
      queryBuilder.andWhere('property.id = :propertyId', {
        propertyId: query.propertyId,
      });
    }
    if (query.tenantId) {
      queryBuilder.andWhere('tenant.id = :tenantId', {
        tenantId: query.tenantId,
      });
    }
    if (query.unitId) {
      queryBuilder.andWhere('unit.id = :unitId', { unitId: query.unitId });
    }
    if (query.status) {
      queryBuilder.andWhere('maintenanceRequest.status = :status', {
        status: query.status,
      });
    }
    if (query.priority) {
      queryBuilder.andWhere('maintenanceRequest.priority = :priority', {
        priority: query.priority,
      });
    }
    if (query.type) {
      queryBuilder.andWhere('maintenanceRequest.type = :type', {
        type: query.type,
      });
    }
    if (query.subType) {
      queryBuilder.andWhere('maintenanceRequest.subType = :subType', {
        subType: query.subType,
      });
    }
    queryBuilder.orderBy('maintenanceRequest.createdAt', 'DESC');
    const maintenanceRequests = await queryBuilder.getMany();
    return maintenanceRequests;
  }
}
