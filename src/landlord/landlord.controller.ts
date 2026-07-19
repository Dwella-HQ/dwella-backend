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
import { LandlordService } from './landlord.service';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { QueryLandlordDto } from './dto/query-landlord.dto';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';
import { UpdateLandlordProfileDto } from './dto/update-landlord-profile.dto';
import { UpdateLandlordPlatformPreferencesDto } from './dto/update-landlord-platform-preferences.dto';
import { UpdateLandlordNotificationPreferencesDto } from './dto/update-landlord-notification-preferences.dto';
import { UpdateLandlordGracePeriodDto } from './dto/update-landlord-grace-period.dto';
import { UpdateLandlordLateFeeDto } from './dto/update-landlord-late-fee.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateLandlordKybDto } from './dto/create-landlord-kyb.dto';
import { UpdateLandlordKybDto } from './dto/update-landlord-kyb.dto';
import { UpdateLandlordBankAccountDetailsDto } from './dto/update-landlord-bank-account-details.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('landlord')
export class LandlordController {
  constructor(private readonly landlordService: LandlordService) {}

  @RequirePermissions(PERMISSIONS.CREATE_LANDLORD)
  @Post()
  async create(@Body() createLandlordDto: CreateLandlordDto) {
    const data = await this.landlordService.create(createLandlordDto);
    return {
      message: 'Landlord created successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_LANDLORD)
  @Get()
  async findAll() {
    const data = await this.landlordService.findAll();
    return {
      message: 'Landlords fetched successfully',
      data,
      success: true,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.landlordService.findOne(id);
    return {
      message: 'Landlord fetched successfully',
      data,
      success: true,
    };
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const data = await this.landlordService.findByUserId(userId);
    return {
      message: 'Landlord fetched successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_LANDLORD)
  @Get('query')
  async query(@Query() queryLandlordDto: QueryLandlordDto) {
    const data = await this.landlordService.query(queryLandlordDto);
    return {
      message: 'Landlords queried successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLandlordDto: UpdateLandlordDto,
  ) {
    const data = await this.landlordService.update(id, updateLandlordDto);
    return {
      message: 'Landlord updated successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Post(':id/kyb')
  async createKyb(
    @Param('id') id: string,
    @Body() createLandlordKybDto: CreateLandlordKybDto,
  ) {
    const data = await this.landlordService.createLandlordKyb(
      id,
      createLandlordKybDto,
    );
    return {
      message: 'Landlord KYB created successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_LANDLORD)
  @Get(':id/kyb')
  async getKyb(@Param('id') id: string) {
    const data = await this.landlordService.getLandlordKybByLandlordId(id);
    return {
      message: 'Landlord KYB fetched successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id/kyb')
  async updateKyb(
    @Param('id') id: string,
    @Body() updateLandlordKybDto: UpdateLandlordKybDto,
  ) {
    const data = await this.landlordService.updateLandlordKyb(
      id,
      updateLandlordKybDto,
    );
    return {
      message: 'Landlord KYB updated successfully',
      data,
      success: true,
    };
  }

  @Post(':id/verify')
  async initiateLandlordVerification(@Param('id') id: string) {
    const data =
      await this.landlordService.createNewLandlordVerificationRequest(id);
    return {
      message: 'Landlord verification request created successfully',
      data,
      success: true,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.landlordService.remove(id);
    return {
      message: 'Landlord deleted successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_LANDLORD)
  @Get(':id/settings')
  async getLandlordSettings(@Param('id') id: string) {
    const data = await this.landlordService.getLandlordSettings(id);
    return {
      message: 'Landlord settings fetched successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateLandlordProfileDto: UpdateLandlordProfileDto,
  ) {
    const data = await this.landlordService.updateProfile(
      id,
      updateLandlordProfileDto,
    );
    return {
      message: 'Landlord profile updated successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id/settings/platform-preferences')
  async updatePlatformPreferences(
    @Param('id') id: string,
    @Body() updatePlatformPreferencesDto: UpdateLandlordPlatformPreferencesDto,
  ) {
    const data = await this.landlordService.updateLandlordPlatformPreferences(
      id,
      updatePlatformPreferencesDto,
    );
    return {
      message: 'Landlord platform preferences updated successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id/settings/notification-preferences')
  async updateNotificationPreferences(
    @Param('id') id: string,
    @Body()
    updateLandlordNotificationPreferencesDto: UpdateLandlordNotificationPreferencesDto,
  ) {
    const data =
      await this.landlordService.updateLandlordNotificationPreferences(
        id,
        updateLandlordNotificationPreferencesDto,
      );
    return {
      message: 'Landlord notification preferences updated successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id/settings/grace-periods')
  async updateGracePeriods(
    @Param('id') id: string,
    @Body() updateLandlordGracePeriodDto: UpdateLandlordGracePeriodDto,
  ) {
    const data = await this.landlordService.updateLandlordGracePeriods(
      id,
      updateLandlordGracePeriodDto,
    );
    return {
      message: 'Landlord grace periods updated successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id/settings/late-fee')
  async updateLateFeeSettings(
    @Param('id') id: string,
    @Body() updateLandlordLateFeeDto: UpdateLandlordLateFeeDto,
  ) {
    const data = await this.landlordService.updateLandlordLateFeeSettings(
      id,
      updateLandlordLateFeeDto,
    );
    return {
      message: 'Landlord late fee settings updated successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id/settings/bank-account')
  async updateBankAccountDetails(
    @Param('id') id: string,
    @Body()
    updateLandlordBankAccountDetailsDto: UpdateLandlordBankAccountDetailsDto,
  ) {
    const data = await this.landlordService.updateLandlordBankAccountDetails(
      id,
      updateLandlordBankAccountDetailsDto,
    );
    return {
      message: 'Landlord bank account details updated successfully',
      data,
      success: true,
    };
  }
}
