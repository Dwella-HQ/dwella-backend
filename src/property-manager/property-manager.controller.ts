import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PropertyManagerService } from './property-manager.service';
import { CreatePropertyManagerDto } from './dto/create-property-manager.dto';
import { UpdatePropertyManagerDto } from './dto/update-property-manager.dto';

@Controller('property-manager')
export class PropertyManagerController {
  constructor(private readonly propertyManagerService: PropertyManagerService) {}

  @Post()
  create(@Body() createPropertyManagerDto: CreatePropertyManagerDto) {
    return this.propertyManagerService.create(createPropertyManagerDto);
  }

  @Get()
  findAll() {
    return this.propertyManagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyManagerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyManagerDto: UpdatePropertyManagerDto) {
    return this.propertyManagerService.update(+id, updatePropertyManagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyManagerService.remove(+id);
  }
}
