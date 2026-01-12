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
import { AmenitiesService } from './amenities.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PERMISSIONS } from 'src/utils/constants';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @RequirePermissions(PERMISSIONS.MANAGE_AMENITIES)
  @Post()
  async create(@Body() createAmenityDto: CreateAmenityDto) {
    const data = await this.amenitiesService.create(createAmenityDto);
    return {
      success: true,
      message: 'Amenity created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.amenitiesService.findAll();
    return {
      success: true,
      message: 'Amenities retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.amenitiesService.findOne(id);
    return {
      success: true,
      message: 'Amenity retrieved successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_AMENITIES)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAmenityDto: UpdateAmenityDto,
  ) {
    const data = await this.amenitiesService.update(id, updateAmenityDto);
    return {
      success: true,
      message: 'Amenity updated successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_AMENITIES)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.amenitiesService.remove(id);
    return {
      success: true,
      message: 'Amenity removed successfully',
      data,
    };
  }
}
