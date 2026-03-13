import { Module } from '@nestjs/common';
import { LandlordService } from './landlord.service';
import { LandlordController } from './landlord.controller';
import { UserModule } from 'src/user/user.module';
import { Landlord } from './entities/landlord.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandLordApprovedGuard } from './guards/landlord.guard';
import { LandlordSettings } from './entities/landlord-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Landlord, LandlordSettings]), UserModule],
  controllers: [LandlordController],
  providers: [LandlordService, LandLordApprovedGuard],
  exports: [LandlordService, LandLordApprovedGuard],
})
export class LandlordModule {}
