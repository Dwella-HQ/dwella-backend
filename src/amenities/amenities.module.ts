import { Module } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { Amenity } from './entities/amenity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity])],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
