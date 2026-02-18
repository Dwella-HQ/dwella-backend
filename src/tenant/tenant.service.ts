/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lease } from './entities/lease.entity';
import { Tenant } from './entities/tenant.entity';
import { LessThan, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PropertyService } from 'src/property/property.service';
import { FileService } from 'src/file/file.service';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    private readonly userService: UserService,
    private readonly propertyService: PropertyService,
    private readonly fileService: FileService,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    const user = await this.userService.findOne(createTenantDto.userId);
    const unit = await this.propertyService.getUnit(createTenantDto.unitId);
    const lease = this.leaseRepository.create({
      unit,
      startDate: createTenantDto.leaseStartDate,
      endDate: createTenantDto.leaseEndDate,
      rentFrequency: createTenantDto.rentFrequency,
      rentAmount: createTenantDto.rentAmount,
      securityDeposit: createTenantDto.securityDeposit,
      securityDepositFrequency: createTenantDto.securityDepositFrequency,
    });
    if (createTenantDto.leaseDocumentId) {
      const document = await this.fileService.findFileById(
        createTenantDto.leaseDocumentId,
      );
      lease.document = document;
    }
    const savedLease = await this.leaseRepository.save(lease);
    const tenant = this.tenantRepository.create({
      user,
      leases: [savedLease],
      currentUnit: unit,
    });
    return await this.tenantRepository.save(tenant);
  }

  async findAll(queryPaginationDto: QueryPaginationDto) {
    const { limit = 10, cursor } = queryPaginationDto;
    const tenants = await this.tenantRepository.find({
      relations: ['user', 'leases', 'currentUnit'],
      order: { createdAt: 'DESC' },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      where: cursor ? { createdAt: LessThan(cursor) } : {},
    });
    return tenants;
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: {
        user: true,
        leases: true,
        currentUnit: true,
      },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }
    return tenant;
  }

  update(id: string, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  async remove(id: string) {
    const result = await this.tenantRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant not found`);
    }
    return true;
  }
}
