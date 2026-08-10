import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceRequestTypesService } from './maintenance-request-types.service';
import { CreateMaintenanceRequestTypeDto } from './dto/create-maintenance-request-type.dto';
import { UpdateMaintenanceRequestTypeDto } from './dto/update-maintenance-request-subtype.dto';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';
import { CreateMaintenanceRequestSubTypeDto } from './dto/create-maintenance-request-subtype.dto';
import { UpdateMaintenanceRequestSubTypeDto } from './dto/update-maintenance-request-type.dto';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
@Controller('maintenance-request-types')
export class MaintenanceRequestTypesController {
  constructor(
    private readonly maintenanceRequestTypesService: MaintenanceRequestTypesService,
  ) {}

  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  @Post()
  async create(
    @Body() createMaintenanceRequestTypeDto: CreateMaintenanceRequestTypeDto,
  ) {
    const data = await this.maintenanceRequestTypesService.create(
      createMaintenanceRequestTypeDto,
    );
    return {
      success: true,
      message: 'Maintenance request type created successfully',
      data,
    };
  }

  @Post(':typeId/subtype')
  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  async addSubType(
    @Param('typeId') typeId: string,
    @Body()
    createMaintenanceRequestSubTypeDto: CreateMaintenanceRequestSubTypeDto,
  ) {
    const data = await this.maintenanceRequestTypesService.addSubType(
      typeId,
      createMaintenanceRequestSubTypeDto,
    );
    return {
      success: true,
      message: 'Maintenance request subtype added successfully',
      data,
    };
  }

  @Get(':typeId/subtypes')
  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  async getSubTypes(@Param('typeId') typeId: string) {
    const data = await this.maintenanceRequestTypesService.getSubTypes(typeId);
    return {
      success: true,
      message: 'Maintenance request subtypes retrieved successfully',
      data,
    };
  }

  @Public()
  @Get()
  async findAll() {
    const data = await this.maintenanceRequestTypesService.findAll();
    return {
      success: true,
      message: 'Maintenance request types retrieved successfully',
      data,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.maintenanceRequestTypesService.findOne(id);
    return {
      success: true,
      message: 'Maintenance request type retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  async update(
    @Param('id') id: string,
    @Body() updateMaintenanceRequestTypeDto: UpdateMaintenanceRequestTypeDto,
  ) {
    const data = await this.maintenanceRequestTypesService.update(
      id,
      updateMaintenanceRequestTypeDto,
    );
    return {
      success: true,
      message: 'Maintenance request type updated successfully',
      data,
    };
  }

  @Patch('subtype/:subTypeId')
  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  async updateSubType(
    @Param('subTypeId') subTypeId: string,
    @Body()
    updateMaintenanceRequestSubTypeDto: UpdateMaintenanceRequestSubTypeDto,
  ) {
    const data = await this.maintenanceRequestTypesService.updateSubType(
      subTypeId,
      updateMaintenanceRequestSubTypeDto,
    );
    return {
      success: true,
      message: 'Maintenance request subtype updated successfully',
      data,
    };
  }

  @Delete('subtype/:subTypeId')
  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  async deleteSubType(@Param('subTypeId') subTypeId: string) {
    await this.maintenanceRequestTypesService.deleteSubType(subTypeId);
    return {
      success: true,
      message: 'Maintenance request subtype deleted successfully',
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.maintenanceRequestTypesService.remove(id);
    return {
      success: true,
      message: 'Maintenance request type deleted successfully',
    };
  }

  @Get('name/:name')
  async findOneByName(@Param('name') name: string) {
    const data = await this.maintenanceRequestTypesService.findOneByName(name);
    return {
      success: true,
      message: 'Maintenance request type retrieved successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUEST_TYPES)
  @Delete('subtype/:typeId')
  async deleteSubTypesByTypeId(@Param('typeId') typeId: string) {
    await this.maintenanceRequestTypesService.deleteSubType(typeId);
    return {
      success: true,
      message: 'Maintenance request subtypes deleted successfully',
    };
  }
}
