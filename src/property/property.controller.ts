import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { LandLordApprovedGuard } from 'src/landlord/guards/landlord.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { AdminRoles, PERMISSIONS } from 'src/utils/constants';
import { RolesGuard } from 'src/rbac/guards/role.guard';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
  LandLordApprovedGuard,
  RolesGuard,
)
@ApiBearerAuth()
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @RequirePermissions(PERMISSIONS.CREATE_PROPERTY)
  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    const data = await this.propertyService.create(createPropertyDto);
    return {
      success: true,
      message: 'Property created successfully',
      data: data,
    };
  }

  @RequireRoles(...AdminRoles)
  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get()
  async findAll() {
    const data = await this.propertyService.findAll();
    return {
      success: true,
      message: 'Properties retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.propertyService.findOne(id);
    return {
      success: true,
      message: 'Property retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const data = await this.propertyService.update(id, updatePropertyDto);
    return {
      success: true,
      message: 'Property updated successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.APPROVE_PROPERTY)
  @Post(':id/approve')
  async approveProperty(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    const data = await this.propertyService.approveProperty(id, user);
    return {
      success: true,
      message: 'Property approved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  @Post(':id/unit')
  async addUnit(@Param('id') id: string, @Body() createUnitDto: CreateUnitDto) {
    const data = await this.propertyService.createUnit(id, createUnitDto);
    return {
      success: true,
      message: 'Unit added successfully',
      data: data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.propertyService.remove(id);
    return {
      success: true,
      message: 'Property removed successfully',
      data: data,
    };
  }
}
