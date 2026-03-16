import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementGateway } from './announcement.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './entities/announcement.entity';
import { PropertyModule } from 'src/property/property.module';
import { LandlordModule } from 'src/landlord/landlord.module';
import { TenantModule } from 'src/tenant/tenant.module';
import { PropertyManagerModule } from 'src/property-manager/property-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
    PropertyModule,
    LandlordModule,
    TenantModule,
    PropertyManagerModule,
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService, AnnouncementGateway],
})
export class AnnouncementModule {}
