/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lease } from './entities/lease.entity';
import { Tenant } from './entities/tenant.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PropertyService } from 'src/property/property.service';
import { FileService } from 'src/file/file.service';

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
    });
    await this.tenantRepository.save(tenant);
    return 'This action adds a new tenant';
  }

  findAll() {
    return `This action returns all tenant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }
}
