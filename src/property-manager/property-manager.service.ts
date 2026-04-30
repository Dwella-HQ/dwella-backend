/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePropertyManagerDto } from './dto/create-property-manager.dto';
import { UpdatePropertyManagerDto } from './dto/update-property-manager.dto';
import { PropertyManager } from './entities/property-manager.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { AddressService } from 'src/address/address.service';
import { LandlordService } from 'src/landlord/landlord.service';
import { AddLandlordDto } from './dto/add-landlord.dto';
import { RemoveLandlordDto } from './dto/remove-landlord.dto';
import { InvitePropertyManagerDto } from './dto/invite-property-manager.dto';
import { PropertyService } from 'src/property/property.service';
import { Property } from 'src/property/entities/property.entity';
import {
  INVITE_STATUS,
  RegistrationTypeEnum,
  USER_ROLES,
} from 'src/utils/constants';
import { generateRandomString } from 'src/utils/misc';
import { addDays } from 'date-fns';
import { PropertyManagerInvite } from './entities/property-manager-invite.entity';
import { EnvironmentVariables } from 'src/config/env.config';
import { EmailService } from 'src/notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PropertyManagerService {
  constructor(
    @InjectRepository(PropertyManager)
    private propertyManagerRepository: Repository<PropertyManager>,
    @InjectRepository(PropertyManagerInvite)
    private propertyManagerInviteRepository: Repository<PropertyManagerInvite>,
    private userService: UserService,
    private addressService: AddressService,
    private landlordService: LandlordService,
    private propertyService: PropertyService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}
  async create(createPropertyManagerDto: CreatePropertyManagerDto) {
    const user = await this.userService.findOne(
      createPropertyManagerDto.userId,
    );
    const landlord = await this.landlordService.findOne(
      createPropertyManagerDto.landlordId,
    );
    const properties: Property[] = [];
    for (const propertyId of createPropertyManagerDto.propertyIds) {
      const property = await this.propertyService.findOne(propertyId);
      if (property.landlord.id !== createPropertyManagerDto.landlordId) {
        throw new NotFoundException(
          `Property with id ${propertyId} not found for this landlord`,
        );
      }
      properties.push(property);
    }
    const propertyManager = this.propertyManagerRepository.create({
      user: user,
      landlord: landlord,
      permissions: createPropertyManagerDto.permissions,
      properties: properties,
    });
    return this.propertyManagerRepository.save(propertyManager);
  }

  @OnEvent('propertyManager.created')
  async propertyManagerUserCreated(user: User) {
    const propertyManager = await this.findOneByEmail(user.email);
    propertyManager.user = user;
    propertyManager.isActive = true;
    await this.propertyManagerRepository.save(propertyManager);
  }

  async findAll() {
    const propertyManagers = await this.propertyManagerRepository.find({
      relations: {
        user: true,
        landlord: true,
      },
    });
    return propertyManagers;
  }

  async findOne(id: string) {
    const propertyManager = await this.propertyManagerRepository.findOne({
      where: { id },
      relations: {
        user: true,
        landlord: true,
      },
    });
    if (!propertyManager) {
      throw new NotFoundException('Property Manager not found');
    }
    return propertyManager;
  }

  async findOneByEmail(email: string) {
    const propertyManager = await this.propertyManagerRepository.findOne({
      where: { email },
      relations: {
        user: true,
        landlord: true,
      },
    });
    if (!propertyManager) {
      throw new NotFoundException('Property Manager not found');
    }
    return propertyManager;
  }

  async getLandlordPropertyManagers(landlordId: string) {
    const propertyManagers = await this.propertyManagerRepository.find({
      where: {
        landlord: { id: landlordId },
      },
      relations: {
        user: true,
        landlord: true,
      },
    });
    return propertyManagers;
  }

  async getUserPropertyManagers(userId: string) {
    const propertyManagers = await this.propertyManagerRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        user: true,
        landlord: true,
        properties: true,
      },
    });
    return propertyManagers;
  }

  async getPropertyPropertyManagers(propertyId: string) {
    const propertyManagers = await this.propertyManagerRepository.find({
      where: {
        properties: { id: propertyId },
      },
      relations: {
        user: true,
        landlord: true,
        properties: true,
      },
    });
    return propertyManagers;
  }

  async update(id: string, updatePropertyManagerDto: UpdatePropertyManagerDto) {
    const propertyManager = await this.findOne(id);
    for (const key in updatePropertyManagerDto) {
      if (updatePropertyManagerDto[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        propertyManager[key] = updatePropertyManagerDto[key];
      }
    }
    return this.propertyManagerRepository.save(propertyManager);
  }

  async remove(id: string) {
    const result = await this.propertyManagerRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Property Manager not found');
    }
    return true;
  }

  async invitePropertyManager(
    landlordId: string,
    invitePropertyManagerDto: InvitePropertyManagerDto,
  ) {
    const landlord = await this.landlordService.findOne(landlordId);

    // Validate properties belong to landlord
    const properties: Property[] = [];
    for (const propertyId of invitePropertyManagerDto.propertyIds) {
      const property = await this.propertyService.findOne(propertyId);
      if (property.landlord.id !== landlordId) {
        throw new NotFoundException(
          `Property with id ${propertyId} not found for this landlord`,
        );
      }
      properties.push(property);
    }

    const token = generateRandomString(32);
    const expiresAt = addDays(new Date(), 7);

    const propertyManagerInvite =
      await this.propertyManagerInviteRepository.save({
        email: invitePropertyManagerDto.email,
        fullName: invitePropertyManagerDto.fullName,
        expiresAt,
        token,
        properties,
        landlord,
        permissions: invitePropertyManagerDto.permissions,
      });
    await this.emailService.sendExternalEmail({
      recipientEmail: invitePropertyManagerDto.email,
      subject: 'Invitation to become a Property Manager',
      template: 'invite-property-manager',
      context: {
        name: invitePropertyManagerDto.fullName,
        landlordName: landlord.businessName,
        acceptLink: `${this.configService.get('BACKEND_URL')}/property-manager/invite/accept-invite?token=${token}`,
        rejectLink: `${this.configService.get('BACKEND_URL')}/property-manager/invite/reject-invite?token=${token}`,
        expirationTime: `7 days`,
      },
    });
    return propertyManagerInvite;
  }

  async acceptInvite(token: string) {
    const invite = await this.propertyManagerInviteRepository.findOne({
      where: { token },
      relations: ['landlord', 'properties'],
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    if (!invite.expiresAt || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }
    if (invite.status !== INVITE_STATUS.PENDING) {
      throw new BadRequestException('Invite already responded to');
    }
    invite.status = INVITE_STATUS.ACCEPTED;
    const user = await this.userService
      .findOneByEmail(invite.email)
      .catch(() => null);
    if (!user) {
      const propertyManager = await this.propertyManagerRepository.save({
        email: invite.email,
        landlord: invite.landlord,
        properties: invite.properties,
        permissions: invite.permissions,
      });
      await this.propertyManagerInviteRepository.save(invite);
      const redirectUrl = `${this.configService.get('FRONTEND_URL')}/auth/signup?role=propertyManager&email=${encodeURIComponent(invite.email)}&fullName=${encodeURIComponent(invite.fullName)}`;
      return redirectUrl;
    }
    user.isEmailVerified = true;
    await Promise.all([
      user.save(),
      this.propertyManagerInviteRepository.save(invite),
      this.propertyManagerRepository.save({
        user,
        landlord: invite.landlord,
        properties: invite.properties,
        permissions: invite.permissions,
        isActive: true,
      }),
    ]);
    const redirectUrl = `${this.configService.get('FRONTEND_URL')}/dashboard/select-landlord`;
    return redirectUrl;
  }

  async rejectInvite(token: string) {
    const invite = await this.propertyManagerInviteRepository.findOne({
      where: { token },
      relations: {
        landlord: true,
      },
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== INVITE_STATUS.PENDING) {
      throw new BadRequestException('Invite already responded to');
    }
    invite.status = INVITE_STATUS.REJECTED;
    await this.propertyManagerInviteRepository.save(invite);
    return true;
  }
}
