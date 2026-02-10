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
import { PropertyManagerService } from './property-manager.service';
import { CreatePropertyManagerDto } from './dto/create-property-manager.dto';
import { UpdatePropertyManagerDto } from './dto/update-property-manager.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AddLandlordDto } from './dto/add-landlord.dto';
import { RemoveLandlordDto } from './dto/remove-landlord.dto';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { RolesGuard } from 'src/rbac/guards/role.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('property-manager')
export class PropertyManagerController {
  constructor(
    private readonly propertyManagerService: PropertyManagerService,
  ) {}

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

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Post(':id/add-landlord')
  async addLandlord(
    @Param('id') id: string,
    @Body() addLandlordDto: AddLandlordDto,
  ) {
    const data = await this.propertyManagerService.addLandlord(
      id,
      addLandlordDto,
    );
    return {
      success: true,
      message: `Landlord added to Property Manager #${id} successfully`,
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Post(':id/remove-landlord')
  async removeLandlord(
    @Param('id') id: string,
    @Body() removeLandlordDto: RemoveLandlordDto,
  ) {
    const data = await this.propertyManagerService.removeLandlord(
      id,
      removeLandlordDto,
    );
    return {
      success: true,
      message: `Landlord removed from Property Manager #${id} successfully`,
      data,
    };
  }

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
