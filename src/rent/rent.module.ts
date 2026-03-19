import { Module } from '@nestjs/common';
import { RentService } from './rent.service';
import { RentController } from './rent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rent } from './entity/rent.entity';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { JOB_NAMES } from 'src/utils/constants';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { RentWorker } from './rent.worker';
import { PropertyModule } from 'src/property/property.module';
import { TenantModule } from 'src/tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rent]),
    BullModule.registerQueue({
      name: JOB_NAMES.RENT_MANAGEMENT_JOB,
    }),
    BullBoardModule.forFeature({
      name: JOB_NAMES.RENT_MANAGEMENT_JOB,
      adapter: BullMQAdapter,
    }),
    TenantModule,
    PropertyModule,
  ],
  controllers: [RentController],
  providers: [RentService, RentWorker],
  exports: [RentService],
})
export class RentModule {}
