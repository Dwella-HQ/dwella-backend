import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { QueryAnnouncementDto } from './dto/query-announcement.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { AnnounementLevelEnum, PERMISSIONS } from 'src/utils/constants';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @RequirePermissions(PERMISSIONS.MANAGE_LANDLORD_ANNOUNCEMENT)
  @Post('landlord/:landlordId')
  async create(
    @Param('landlordId') landlordId: string,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    const data = await this.announcementService.createLandlordAnnouncement(
      landlordId,
      createAnnouncementDto,
    );
    return {
      success: true,
      message: 'Announcement created successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_PROPERTY_ANNOUNCEMENT)
  @Post('property/:propertyId')
  async createPropertyAnnouncement(
    @Param('propertyId') propertyId: string,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    const data = await this.announcementService.createPropertyAnnouncement(
      propertyId,
      createAnnouncementDto,
    );
    return {
      success: true,
      message: 'Announcement created successfully',
      data,
    };
  }

  @Get()
  findAll() {
    return this.announcementService.findAll();
  }

  @Get('query')
  async query(@Query() query: QueryAnnouncementDto) {
    const data = await this.announcementService.query(query);
    return {
      success: true,
      message: 'Announcements retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.announcementService.findOne(id);
    return {
      success: true,
      message: 'Announcement retrieved successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_LANDLORD_ANNOUNCEMENT)
  @Patch(':id/landlord')
  updateLandlordAnnouncement(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.update(
      id,
      updateAnnouncementDto,
      AnnounementLevelEnum.LANDLORD,
    );
  }

  @RequirePermissions(PERMISSIONS.MANAGE_PROPERTY_ANNOUNCEMENT)
  @Patch(':id/property')
  updatePropertyAnnouncement(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.update(
      id,
      updateAnnouncementDto,
      AnnounementLevelEnum.PROPERTY,
    );
  }

  @RequirePermissions(PERMISSIONS.MANAGE_LANDLORD_ANNOUNCEMENT)
  @Delete(':id/landlord')
  async removeLandlordAnnouncement(@Param('id') id: string) {
    await this.announcementService.remove(id, AnnounementLevelEnum.LANDLORD);
    return {
      success: true,
      message: 'Announcement removed successfully',
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_PROPERTY_ANNOUNCEMENT)
  @Delete(':id/property')
  async removePropertyAnnouncement(@Param('id') id: string) {
    await this.announcementService.remove(id, AnnounementLevelEnum.PROPERTY);
    return {
      success: true,
      message: 'Announcement removed successfully',
    };
  }
}
