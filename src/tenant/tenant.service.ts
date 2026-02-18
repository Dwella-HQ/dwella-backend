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
import { InviteTenantDto } from './dto/invite-tenant.dto';
import { TenantInvite } from './entities/tenant-invite.entity';
import { INVITE_STATUS } from 'src/utils/constants';
import { EmailService } from 'src/notification/email/email.service';
import { EnvironmentVariables } from 'src/config/env.config';
import { ConfigService } from '@nestjs/config';
import { addDays } from 'date-fns';
import { generateRandomString } from 'src/utils/misc';

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

  async inviteTenant(inviteTenantDto: InviteTenantDto) {
    const unit = await this.propertyService.getUnit(inviteTenantDto.unitId);
    const expiresAt = addDays(new Date(), 7);
    const token = generateRandomString(32);
    const tenantInvite = this.tenantInviteRepository.create({
      email: inviteTenantDto.email,
      unit,
      token,
      leaseStartDate: inviteTenantDto.leaseStartDate,
      leaseEndDate: inviteTenantDto.leaseEndDate,
      rentFrequency: inviteTenantDto.rentFrequency,
      rentAmount: inviteTenantDto.rentAmount,
      securityDeposit: inviteTenantDto.securityDeposit,
      securityDepositFrequency: inviteTenantDto.securityDepositFrequency,
      expiresAt,
    });
    if (inviteTenantDto.leaseDocumentId) {
      const document = await this.fileService.findFileById(
        inviteTenantDto.leaseDocumentId,
      );
      tenantInvite.document = document;
    }
    const savedInvite = await this.tenantInviteRepository.save(tenantInvite);
    await this.emailService.sendExternalEmail({
      recipientEmail: inviteTenantDto.email,
      subject: 'You have been invited to become a tenant',
      template: 'invite-tenant',
      context: {
        name: inviteTenantDto.fullName,
        propertyName: unit.property?.name,
        unitName: unit.name,
        propertyAddress: unit.property?.address,
        leaseStartDate: inviteTenantDto.leaseStartDate,
        leaseEndDate: inviteTenantDto.leaseEndDate,
        rentAmount: inviteTenantDto.rentAmount,
        rentFrequency: inviteTenantDto.rentFrequency,
        securityDeposit: inviteTenantDto.securityDeposit,
        securityDepositFrequency: inviteTenantDto.securityDepositFrequency,
        leaseDocumentLink: savedInvite.document
          ? savedInvite.document.url
          : null,
        acceptLink: `${this.configService.get('BACKEND_URL')}/tenant/accept-invite/${tenantInvite.id}`,
        rejectLink: `${this.configService.get('BACKEND_URL')}/tenant/reject-invite/${tenantInvite.id}`,
        expirationTime: '7 days',
        template: 'invite-tenant',
      },
    });
  }

  async acceptInvite(token: string) {
    const invite = await this.tenantInviteRepository.findOne({
      where: { token },
      relations: { unit: { property: true }, document: true },
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
      const lease = this.leaseRepository.create({
        unit: invite.unit,
        startDate: invite.leaseStartDate,
        endDate: invite.leaseEndDate,
        rentFrequency: invite.rentFrequency,
        rentAmount: invite.rentAmount,
        securityDeposit: invite.securityDeposit,
        securityDepositFrequency: invite.securityDepositFrequency,
        document: invite.document,
      });
      const savedLease = await this.leaseRepository.save(lease);
      const tenant = this.tenantRepository.create({
        currentUnit: invite.unit,
        leases: [savedLease],
      });
      const [savedTenant] = await Promise.all([
        this.tenantRepository.save(tenant),
        this.tenantInviteRepository.save(invite),
      ]);
      const redirectUrl = `${this.configService.get('FRONTEND_URL')}/auth/register?tenant-id=${savedTenant.id}`;
      return redirectUrl;
    }
    user.isEmailVerified = true;
    const lease = this.leaseRepository.create({
      unit: invite.unit,
      startDate: invite.leaseStartDate,
      endDate: invite.leaseEndDate,
      rentFrequency: invite.rentFrequency,
      rentAmount: invite.rentAmount,
      securityDeposit: invite.securityDeposit,
      securityDepositFrequency: invite.securityDepositFrequency,
      document: invite.document,
    });
    const savedLease = await this.leaseRepository.save(lease);
    const tenant = this.tenantRepository.create({
      user,
      currentUnit: invite.unit,
      leases: [savedLease],
    });
    const [savedTenant] = await Promise.all([
      this.tenantRepository.save(tenant),
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
}
