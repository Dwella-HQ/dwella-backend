import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { LandlordModule } from 'src/landlord/landlord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { Unit } from './entities/unit.entity';
import { PropertySettings } from './entities/property-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, PropertySettings, Unit]),
    LandlordModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
