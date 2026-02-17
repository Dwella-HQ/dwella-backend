/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';

@Injectable()
export class MaintenanceRequestService {
  create(createMaintenanceRequestDto: CreateMaintenanceRequestDto) {
    return 'This action adds a new maintenanceRequest';
  }

  findAll() {
    return `This action returns all maintenanceRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} maintenanceRequest`;
  }

  update(id: number, updateMaintenanceRequestDto: UpdateMaintenanceRequestDto) {
    return `This action updates a #${id} maintenanceRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} maintenanceRequest`;
  }
}
