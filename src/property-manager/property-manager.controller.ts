import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { PropertyManagerService } from './property-manager.service';
import { CreatePropertyManagerDto } from './dto/create-property-manager.dto';
import { UpdatePropertyManagerDto } from './dto/update-property-manager.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { RolesGuard } from 'src/rbac/guards/role.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { AdminRoles, PERMISSIONS } from 'src/utils/constants';
import { Response } from 'express';
import { EnvironmentVariables } from 'src/config/env.config';
import { ConfigService } from '@nestjs/config';
import { InvitePropertyManagerDto } from './dto/invite-property-manager.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('property-manager')
export class PropertyManagerController {
  constructor(
    private readonly propertyManagerService: PropertyManagerService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}
  //temp
  @RequireRoles(...AdminRoles)
  // @RequirePermissions(PERMISSIONS.CREATE_PROPERTY_MANAGER)
  @Post()
  async create(@Body() createPropertyManagerDto: CreatePropertyManagerDto) {
    const data = await this.propertyManagerService.create(
      createPropertyManagerDto,
    );
    return {
      success: true,
      message: 'Property Manager created successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PROPERTY_MANAGER)
  @Get()
  async findAll() {
    const data = await this.propertyManagerService.findAll();
    return {
      success: true,
      message: 'Property Managers retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.propertyManagerService.findOne(id);
    return {
      success: true,
      message: `Property Manager #${id} retrieved successfully`,
      data,
    };
  }

  @Get('landlord/:landlordId')
  async getLandlordPropertyManagers(@Param('landlordId') landlordId: string) {
    const data =
      await this.propertyManagerService.getLandlordPropertyManagers(landlordId);
    return {
      success: true,
      message: `Property Managers retrieved successfully`,
      data,
    };
  }

  @Get('user/:userId')
  async getUserPropertyManagers(@Param('userId') userId: string) {
    const data =
      await this.propertyManagerService.getUserPropertyManagers(userId);
    return {
      success: true,
      message: `Property Managers retrieved successfully`,
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY_MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyManagerDto: UpdatePropertyManagerDto,
  ) {
    const data = await this.propertyManagerService.update(
      id,
      updatePropertyManagerDto,
    );
    return {
      success: true,
      message: `Property Manager #${id} updated successfully`,
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.CREATE_PROPERTY_MANAGER)
  @Post('invite/:landlordId')
  async invite(
    @Param('landlordId') landlordId: string,
    @Body() invitePropertyManagerDto: InvitePropertyManagerDto,
  ) {
    const data = await this.propertyManagerService.invitePropertyManager(
      landlordId,
      invitePropertyManagerDto,
    );
    return {
      success: true,
      message: `Invitation sent successfully`,
      data,
    };
  }

  @Public()
  @Get('accept-invite')
  async acceptInvite(@Query('token') token: string, @Res() res: Response) {
    const redirectUrl = await this.propertyManagerService.acceptInvite(token);
    return res.redirect(redirectUrl);
  }

  @Public()
  @Get('reject-invite')
  async rejectInvite(@Query('token') token: string, @Res() res: Response) {
    await this.propertyManagerService.rejectInvite(token);
    return res.redirect(
      `${this.configService.get('FRONTEND_URL')}/invite-rejected`,
    );
  }

  @RequirePermissions(PERMISSIONS.DELETE_PROPERTY_MANAGER)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.propertyManagerService.remove(id);
    return {
      success: true,
      message: `Property Manager #${id} removed successfully`,
      data,
    };
  }
}
