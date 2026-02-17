import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MaintenanceRequestService } from './maintenance-request.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';

@Controller('maintenance-request')
export class MaintenanceRequestController {
  constructor(
    private readonly maintenanceRequestService: MaintenanceRequestService,
  ) {}

  @Post()
  create(@Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto) {
    return this.maintenanceRequestService.create(createMaintenanceRequestDto);
  }

  @Get()
  findAll() {
    return this.maintenanceRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceRequestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceRequestDto: UpdateMaintenanceRequestDto,
  ) {
    return this.maintenanceRequestService.update(
      +id,
      updateMaintenanceRequestDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceRequestService.remove(+id);
  }
}
