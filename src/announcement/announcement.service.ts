/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { User } from 'src/user/entities/user.entity';
import { AnnounementLevelEnum, USER_ROLES } from 'src/utils/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Announcement } from './entities/announcement.entity';
import { Repository } from 'typeorm';
import { TenantService } from 'src/tenant/tenant.service';
import { Server, Socket } from 'socket.io';
import { PropertyService } from 'src/property/property.service';
import { PropertyManagerService } from 'src/property-manager/property-manager.service';
import { LandlordService } from 'src/landlord/landlord.service';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/entities/file.entity';
import { QueryAnnouncementDto } from './dto/query-announcement.dto';

@Injectable()
export class AnnouncementService {
  private server: Server;

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    private readonly tenantService: TenantService,
    private readonly propertyManagerService: PropertyManagerService,
    private readonly propertyService: PropertyService,
    private readonly landlordService: LandlordService,
    private readonly fileService: FileService,
  ) {}

  bindServer(server: Server) {
    this.server = server;
  }

  async createLandlordAnnouncement(
    landlordId: string,
    createAnnouncementDto: CreateAnnouncementDto,
  ) {
    const landlord = await this.landlordService.findOne(landlordId);
    const announcement = this.announcementRepository.create({
      landlord,
      content: createAnnouncementDto.content,
      title: createAnnouncementDto.title,
      level: AnnounementLevelEnum.LANDLORD,
    });

    if (
      createAnnouncementDto.fileIds &&
      createAnnouncementDto.fileIds.length > 0
    ) {
      const announcementFiles: File[] = [];
      for (const fileId of createAnnouncementDto.fileIds) {
        const file = await this.fileService.findFileById(fileId);
        announcementFiles.push(file);
      }
      announcement.files = announcementFiles;
    }
    await this.announcementRepository.save(announcement);
  }

  async createPropertyAnnouncement(
    propertyId: string,
    createAnnouncementDto: CreateAnnouncementDto,
  ) {
    const property = await this.propertyService.findOne(propertyId);
    const announcement = this.announcementRepository.create({
      property,
      content: createAnnouncementDto.content,
      title: createAnnouncementDto.title,
      level: AnnounementLevelEnum.PROPERTY,
    });

    if (
      createAnnouncementDto.fileIds &&
      createAnnouncementDto.fileIds.length > 0
    ) {
      const announcementFiles: File[] = [];
      for (const fileId of createAnnouncementDto.fileIds) {
        const file = await this.fileService.findFileById(fileId);
        announcementFiles.push(file);
      }
      announcement.files = announcementFiles;
    }
    await this.announcementRepository.save(announcement);
  }

  findAll() {
    return `This action returns all announcement`;
  }

  async findOne(id: string) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
      relations: {
        property: true,
        landlord: true,
      },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }

  async update(
    id: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
    level?: AnnounementLevelEnum,
  ) {
    const announcement = await this.announcementRepository.findOne({
      where: { id, level },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    for (const key in updateAnnouncementDto) {
      if (updateAnnouncementDto[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        announcement[key] = updateAnnouncementDto[key];
      }
      if (key === 'fileIds') {
        const announcementFiles: File[] = [];
        for (const fileId of updateAnnouncementDto.fileIds || []) {
          const file = await this.fileService.findFileById(fileId);
          announcementFiles.push(file);
        }
        announcement.files = announcementFiles;
      }
    }
    const savedAnnouncement =
      await this.announcementRepository.save(announcement);
    return savedAnnouncement;
  }

  async remove(id: string, level?: AnnounementLevelEnum) {
    const result = await this.announcementRepository.delete({
      id,
      level,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Announcement not found');
    }
    return true;
  }

  async query(query: QueryAnnouncementDto) {
    const qb = this.announcementRepository.createQueryBuilder('announcement');
    qb.leftJoinAndSelect('announcement.landlord', 'landlord');
    qb.leftJoinAndSelect('announcement.property', 'property');
    if (query.landlordId) {
      qb.andWhere('announcement.landlordId = :landlordId', {
        landlordId: query.landlordId,
      });
    }
    if (query.propertyId) {
      qb.andWhere('announcement.propertyId = :propertyId', {
        propertyId: query.propertyId,
      });
    }
    if (query.level) {
      qb.andWhere('announcement.level = :level', { level: query.level });
    }

    qb.leftJoinAndSelect('announcement.files', 'file');
    const announcements = await qb.getMany();
    return announcements;
  }

  async getTenantsAnnouncements(tenantId: string) {
    const tenant = await this.tenantService.findOne(tenantId);
    const unit = await this.propertyService.getUnit(tenant.currentUnit.id);
    const property = await this.propertyService.findOne(unit.property.id);

    const landlordAnnouncements = await this.announcementRepository.find({
      where: {
        landlord: {
          id: property.landlord.id,
        },
      },
      relations: {
        files: true,
      },
    });

    const propertyAnnouncements = await this.announcementRepository.find({
      where: {
        property: {
          id: property.id,
        },
      },
      relations: {
        files: true,
      },
    });

    this.server
      .to(`announcements:landlord:${property.landlord.id}`)
      .emit('load:announcements', landlordAnnouncements);
    this.server
      .to(`announcements:property:${property.id}`)
      .emit('load:announcements', propertyAnnouncements);
  }

  async getPropertyAnnouncements(propertyManagerId: string) {
    const propertyManager =
      await this.propertyManagerService.findOne(propertyManagerId);
    const landlordAnnouncements = await this.announcementRepository.find({
      where: {
        landlord: {
          id: propertyManager.landlord.id,
        },
      },
      relations: {
        files: true,
      },
    });

    this.server
      .to(`announcements:landlord:${propertyManager.landlord.id}`)
      .emit('load:announcements', landlordAnnouncements);

    for (const property of propertyManager.properties) {
      const propertyAnnouncements = await this.announcementRepository.find({
        where: {
          property: {
            id: property.id,
          },
        },
        relations: {
          files: true,
        },
      });

      this.server
        .to(`announcements:property:${property.id}`)
        .emit('load:announcements', propertyAnnouncements);
    }
  }

  async joinRoom(client: Socket, user: User) {
    if (user.role.name === USER_ROLES.TENANT) {
      const tenant = await this.tenantService.getTenantByUserId(user.id);
      const unit = await this.propertyService.getUnit(tenant.currentUnit.id);
      const property = await this.propertyService.findOne(unit.property.id);

      await client.join('announcements');
      await client.join(`announcements:landlord:${property.landlord.id}`);
      await client.join(`announcements:property:${property.id}`);
      await this.getTenantsAnnouncements(tenant.id);
    } else if (user.role.name === USER_ROLES.PROPERTY_MANAGER) {
      const propertyManagers =
        await this.propertyManagerService.getUserPropertyManagers(user.id);
      for (const pm of propertyManagers) {
        await client.join(`announcements:landlord:${pm.landlord.id}`);
        for (const property of pm.properties) {
          await client.join(`announcements:property:${property.id}`);
          await this.getPropertyAnnouncements(pm.id);
        }
      }
    }
  }
}
