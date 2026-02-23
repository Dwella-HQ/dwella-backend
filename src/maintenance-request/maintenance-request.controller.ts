import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceRequestService } from './maintenance-request.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';
import { UpdateMaintenanceRequestStatusDto } from './dto/update-maintenance-request-status.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('maintenance-request')
export class MaintenanceRequestController {
  constructor(
    private readonly maintenanceRequestService: MaintenanceRequestService,
  ) {}

  @RequirePermissions(PERMISSIONS.CREATE_MAINTENANCE_REQUEST)
  @Post()
  async create(
    @Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto,
  ) {
    const data = await this.maintenanceRequestService.create(
      createMaintenanceRequestDto,
    );
    return {
      success: true,
      message: 'Maintenance request created successfully',
      data,
    };
  }

  @Get()
  async findAll(@Query() queryDto: QueryPaginationDto) {
    const data = await this.maintenanceRequestService.findAll(queryDto);
    return {
      success: true,
      message: 'Maintenance requests retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.maintenanceRequestService.findOne(id);
    return {
      success: true,
      message: 'Maintenance request retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMaintenanceRequestDto: UpdateMaintenanceRequestDto,
  ) {
    const data = await this.maintenanceRequestService.update(
      id,
      updateMaintenanceRequestDto,
    );
    return {
      success: true,
      message: 'Maintenance request updated successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_MAINTENANCE_REQUESTS)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    updateMaintenanceRequestStatusDto: UpdateMaintenanceRequestStatusDto,
  ) {
    const data = await this.maintenanceRequestService.updateStatus(
      id,
      updateMaintenanceRequestStatusDto.status,
    );
    return {
      success: true,
      message: 'Maintenance request status updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.maintenanceRequestService.remove(id);
    return {
      success: true,
      message: 'Maintenance request deleted successfully',
    };
  }
}
