import { Module } from '@nestjs/common';
import { PropertyManagerService } from './property-manager.service';
import { PropertyManagerController } from './property-manager.controller';

@Module({
  controllers: [PropertyManagerController],
  providers: [PropertyManagerService],
})
export class PropertyManagerModule {}
