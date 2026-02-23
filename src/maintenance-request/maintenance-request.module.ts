import { Module } from '@nestjs/common';
import { MaintenanceRequestService } from './maintenance-request.service';
import { MaintenanceRequestController } from './maintenance-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { PropertyModule } from 'src/property/property.module';
import { TenantModule } from 'src/tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceRequest]),
    PropertyModule,
    TenantModule,
  ],
  controllers: [MaintenanceRequestController],
  providers: [MaintenanceRequestService],
})
export class MaintenanceRequestModule {}
