/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lease } from './entities/lease.entity';
import { Tenant } from './entities/tenant.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PropertyService } from 'src/property/property.service';
import { FileService } from 'src/file/file.service';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';
import { InviteTenantDto } from './dto/invite-tenant.dto';
import { TenantInvite } from './entities/tenant-invite.entity';
import { INVITE_STATUS } from 'src/utils/constants';
import { EmailService } from 'src/notification/email/email.service';
import { EnvironmentVariables } from 'src/config/env.config';
import { ConfigService } from '@nestjs/config';
import { addDays } from 'date-fns';
import { generateRandomString } from 'src/utils/misc';
import { QueryLeaseDto } from './dto/query-lease.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantInvite)
    private readonly tenantInviteRepository: Repository<TenantInvite>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    private readonly userService: UserService,
    private readonly propertyService: PropertyService,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    const unit = await this.propertyService.getUnit(createTenantDto.unitId);
    if (unit.tenant) {
      throw new BadRequestException('Unit is already occupied by a tenant');
    }
    const user = await this.userService.findOne(createTenantDto.userId);
    const lease = this.leaseRepository.create({
      unit,
      startDate: createTenantDto.leaseStartDate,
      endDate: createTenantDto.leaseEndDate,
      rentFrequency: createTenantDto.rentFrequency,
      rentAmount: createTenantDto.rentAmount,
      securityDeposit: createTenantDto.securityDeposit,
      serviceCharge: createTenantDto.serviceCharge,
      serviceChargeFrequency: createTenantDto.serviceChargeFrequency,
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
      employerContact: createTenantDto.employerContact,
      employerName: createTenantDto.employerName,
      isEmployed: createTenantDto.isEmployed,
      idNumber: createTenantDto.idNumber,
      idType: createTenantDto.idType,
      nextOfKinDetails: createTenantDto.nextOfKinDetails,
    });
    if (createTenantDto.idDocumentId) {
      const idDocument = await this.fileService.findFileById(
        createTenantDto.idDocumentId,
      );
      tenant.idDocument = idDocument;
    }
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

  async getTenantByUserId(userId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        leases: true,
        currentUnit: true,
      },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant not found for user`);
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

  async inviteTenant(inviteTenantDto: InviteTenantDto) {
    const unit = await this.propertyService.getUnit(inviteTenantDto.unitId);
    if (unit.tenant) {
      throw new BadRequestException('Unit is already occupied by a tenant');
    }
    const expiresAt = addDays(new Date(), 7);
    const token = generateRandomString(32);
    const activeInvite = await this.tenantInviteRepository.findOne({
      where: {
        unit: { id: inviteTenantDto.unitId },
        status: INVITE_STATUS.PENDING,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (activeInvite) {
      throw new BadRequestException(
        'There is already an active invite for this unit',
      );
    }
    const tenantInvite = this.tenantInviteRepository.create({
      email: inviteTenantDto.email,
      fullName: inviteTenantDto.fullName,
      unit,
      token,
      leaseStartDate: inviteTenantDto.leaseStartDate,
      leaseEndDate: inviteTenantDto.leaseEndDate,
      rentFrequency: inviteTenantDto.rentFrequency,
      rentAmount: inviteTenantDto.rentAmount,
      securityDeposit: inviteTenantDto.securityDeposit,
      serviceCharge: inviteTenantDto.serviceCharge,
      serviceChargeFrequency: inviteTenantDto.serviceChargeFrequency,
      idType: inviteTenantDto.idType,
      idNumber: inviteTenantDto.idNumber,
      isEmployed: inviteTenantDto.isEmployed,
      employerName: inviteTenantDto.employerName,
      employerContact: inviteTenantDto.employerContact,
      nextOfKinDetails: inviteTenantDto.nextOfKinDetails,
      expiresAt,
    });
    let leaseDocumentLink = '';
    if (inviteTenantDto.leaseDocumentId) {
      const document = await this.fileService.findFileById(
        inviteTenantDto.leaseDocumentId,
      );
      tenantInvite.documentId = document.id;
      leaseDocumentLink = document.url;
    }
    if (inviteTenantDto.idDocumentId) {
      const idDocument = await this.fileService.findFileById(
        inviteTenantDto.idDocumentId,
      );
      tenantInvite.idDocumentId = idDocument.id;
    }
    const savedInvite = await this.tenantInviteRepository.save(tenantInvite);
    await this.emailService.sendExternalEmail({
      recipientEmail: savedInvite.email,
      subject: 'You have been invited to become a tenant',
      template: 'invite-tenant',
      context: {
        name: savedInvite.fullName,
        propertyName: unit.property?.name,
        unitName: unit.name,
        propertyAddress: unit.property?.address
          ? {
              address: unit.property.address.address,
              city: unit.property.address.city,
              state: unit.property.address.state,
              country: unit.property.address.country,
              postalCode: unit.property.address.postalCode,
            }
          : null,
        leaseStartDate: savedInvite.leaseStartDate,
        leaseEndDate: savedInvite.leaseEndDate,
        rentAmount: savedInvite.rentAmount,
        rentFrequency: savedInvite.rentFrequency,
        securityDeposit: savedInvite.securityDeposit,
        serviceCharge: savedInvite.serviceCharge,
        serviceChargeFrequency: savedInvite.serviceChargeFrequency,
        leaseDocumentLink,
        acceptLink: `${this.configService.get('BACKEND_URL')}/tenant/invite/accept-invite?token=${savedInvite.token}`,
        rejectLink: `${this.configService.get('BACKEND_URL')}/tenant/invite/reject-invite?token=${savedInvite.token}`,
        expirationTime: '7 days',
        template: 'invite-tenant',
      },
    });
  }

  async acceptInvite(token: string) {
    const invite = await this.tenantInviteRepository.findOne({
      where: { token },
      relations: { unit: true },
    });
    if (!invite || invite.expiresAt < new Date()) {
      throw new NotFoundException('Invite not found or expired');
    }
    if (invite.status !== INVITE_STATUS.PENDING) {
      throw new NotFoundException('Invite already responded to');
    }
    invite.status = INVITE_STATUS.ACCEPTED;
    const user = await this.userService
      .findOneByEmail(invite.email)
      .catch(() => null);
    if (!user) {
      const tenant = await this.tenantRepository.save({
        currentUnit: invite.unit,
        idNumber: invite.idNumber,
        idType: invite.idType,
        isEmployed: invite.isEmployed,
        employerName: invite.employerName,
        employerContact: invite.employerContact,
        nextOfKinDetails: invite.nextOfKinDetails,
        idDocument: {
          id: invite.idDocumentId,
        },
      });
      const lease = this.leaseRepository.create({
        tenant,
        unit: invite.unit,
        startDate: invite.leaseStartDate,
        endDate: invite.leaseEndDate,
        rentFrequency: invite.rentFrequency,
        rentAmount: invite.rentAmount,
        securityDeposit: invite.securityDeposit,
        serviceCharge: invite.serviceCharge,
        serviceChargeFrequency: invite.serviceChargeFrequency,
        document: {
          id: invite.documentId,
        },
      });
      await Promise.all([
        this.leaseRepository.save(lease),
        this.tenantInviteRepository.save(invite),
      ]);

      const redirectUrl = `${this.configService.get('FRONTEND_URL')}/auth/signup?role=tenant&tenant-id=${tenant.id}`;
      return redirectUrl;
    }
    user.isEmailVerified = true;
    const tenant = await this.tenantRepository.save({
      user,
      currentUnit: invite.unit,
      employerContact: invite.employerContact,
      employerName: invite.employerName,
      isEmployed: invite.isEmployed,
      idDocument: {
        id: invite.idDocumentId,
      },
      idNumber: invite.idNumber,
      idType: invite.idType,
      nextOfKinDetails: invite.nextOfKinDetails,
    });

    const lease = this.leaseRepository.create({
      unit: invite.unit,
      tenant,
      startDate: invite.leaseStartDate,
      endDate: invite.leaseEndDate,
      rentFrequency: invite.rentFrequency,
      rentAmount: invite.rentAmount,
      securityDeposit: invite.securityDeposit,
      serviceCharge: invite.serviceCharge,
      serviceChargeFrequency: invite.serviceChargeFrequency,
      document: {
        id: invite.documentId,
      },
    });
    await Promise.all([
      this.leaseRepository.save(lease),
      user.save(),
      this.tenantInviteRepository.save(invite),
    ]);
    const redirectUrl = `${this.configService.get('FRONTEND_URL')}/tenants/dashboard`;
    return redirectUrl;
  }

  async rejectInvite(token: string) {
    const invite = await this.tenantInviteRepository.findOne({
      where: { token },
    });
    if (!invite || invite.expiresAt < new Date()) {
      throw new NotFoundException('Invite not found or expired');
    }
    if (invite.status !== INVITE_STATUS.PENDING) {
      throw new NotFoundException('Invite already responded to');
    }
    invite.status = INVITE_STATUS.REJECTED;
    await this.tenantInviteRepository.save(invite);
    return true;
  }

  async queryLease(queryLeaseDto: QueryLeaseDto) {
    const queryBuilder = this.leaseRepository.createQueryBuilder('lease');
    queryBuilder.leftJoinAndSelect('lease.tenant', 'tenant');
    queryBuilder.leftJoinAndSelect('lease.unit', 'unit');
    queryBuilder.leftJoinAndSelect('unit.property', 'property');
    if (queryLeaseDto.tenantId) {
      queryBuilder.andWhere('lease.tenantId = :tenantId', {
        tenantId: queryLeaseDto.tenantId,
      });
    }
    if (queryLeaseDto.propertyId) {
      queryBuilder.andWhere('unit.propertyId = :propertyId', {
        propertyId: queryLeaseDto.propertyId,
      });
    }
    if (queryLeaseDto.leaseId) {
      queryBuilder.andWhere('lease.id = :leaseId', {
        leaseId: queryLeaseDto.leaseId,
      });
    }
    if (queryLeaseDto.active !== undefined) {
      queryBuilder.andWhere('lease.isActive = :active', {
        active: queryLeaseDto.active,
      });
    }
    if (queryLeaseDto.startDate) {
      queryBuilder.andWhere('lease.startDate >= :startDate', {
        startDate: queryLeaseDto.startDate,
      });
    }
    if (queryLeaseDto.endDate) {
      queryBuilder.andWhere('lease.endDate <= :endDate', {
        endDate: queryLeaseDto.endDate,
      });
    }
    return queryBuilder.getMany();
  }
}
