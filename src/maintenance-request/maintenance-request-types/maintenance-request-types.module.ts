import { Module } from '@nestjs/common';
import { MaintenanceRequestTypesService } from './maintenance-request-types.service';
import { MaintenanceRequestTypesController } from './maintenance-request-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceRequestSubType } from './entities/maintenance-request-subtypes.entity';
import { MaintenanceRequestType } from './entities/maintenance-request-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaintenanceRequestType,
      MaintenanceRequestSubType,
    ]),
  ],
  controllers: [MaintenanceRequestTypesController],
  providers: [MaintenanceRequestTypesService],
  exports: [MaintenanceRequestTypesService],
})
export class MaintenanceRequestTypesModule {}
