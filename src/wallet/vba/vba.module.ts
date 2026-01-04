import { Module } from '@nestjs/common';
import { VbaService } from './vba.service';
import { VbaController } from './vba.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VBA } from './entity/vba.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VBA])],
  controllers: [VbaController],
  providers: [VbaService],
  exports: [VbaService],
})
export class VbaModule {}
