import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { LandlordModule } from 'src/landlord/landlord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { Unit } from './entities/units.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Unit]), LandlordModule],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
