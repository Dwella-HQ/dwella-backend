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
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { LandLordApprovedGuard } from 'src/landlord/guards/landlord.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { AdminRoles, PERMISSIONS } from 'src/utils/constants';
import { RolesGuard } from 'src/rbac/guards/role.guard';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';
import { QueryPropertyDto } from './dto/query-property.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @RequirePermissions(PERMISSIONS.CREATE_PROPERTY)
  @UseGuards(LandLordApprovedGuard)
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

  // @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get('query')
  async queryProperties(@Query() queryPropertyDto: QueryPropertyDto) {
    const data = await this.propertyService.query(queryPropertyDto);
    return {
      success: true,
      message: 'Properties retrieved successfully',
      data: data,
    };
  }

  @Get('landlord/:landlordId')
  async getLandlordProperties(@Param('landlordId') landlordId: string) {
    const data = await this.propertyService.getLandlordProperties(landlordId);
    return {
      success: true,
      message: 'Landlord properties retrieved successfully',
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

  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get(':id/units')
  async getUnits(@Param('id') id: string) {
    const data = await this.propertyService.fetchPropertyUnits(id);
    return {
      success: true,
      message: 'Units retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get('unit/:unitId')
  async getUnit(@Param('unitId') unitId: string) {
    const data = await this.propertyService.getUnit(unitId);
    return {
      success: true,
      message: 'Unit retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  @Patch('unit/:unitId')
  async updateUnit(
    @Param('unitId') unitId: string,
    @Body() updateUnitDto: CreateUnitDto,
  ) {
    const data = await this.propertyService.updateUnit(unitId, updateUnitDto);
    return {
      success: true,
      message: 'Unit updated successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.DELETE_PROPERTY)
  @Delete('unit/:unitId')
  async deleteUnit(@Param('unitId') unitId: string) {
    await this.propertyService.deleteUnit(unitId);
    return {
      success: true,
      message: 'Unit deleted successfully',
    };
  }

  @RequirePermissions(PERMISSIONS.DELETE_PROPERTY)
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
