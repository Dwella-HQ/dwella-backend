import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateUnitDto } from './dto/create-unit.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    const data = await this.propertyService.create(createPropertyDto);
    return {
      success: true,
      message: 'Property created successfully',
      data: data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.propertyService.findAll();
    return {
      success: true,
      message: 'Properties retrieved successfully',
      data: data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.propertyService.findOne(id);
    return {
      success: true,
      message: 'Property retrieved successfully',
      data: data,
    };
  }

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
