import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementGateway } from './announcement.gateway';

@Module({
  imports: [],
  controllers: [AnnouncementController],
  providers: [AnnouncementService, AnnouncementGateway],
})
export class AnnouncementModule {}
