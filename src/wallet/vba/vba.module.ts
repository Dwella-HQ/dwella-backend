import { Module } from '@nestjs/common';
import { VbaService } from './vba.service';
import { VbaController } from './vba.controller';

@Module({
  controllers: [VbaController],
  providers: [VbaService],
})
export class VbaModule {}
