import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { LandlordModule } from 'src/landlord/landlord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Verification]), LandlordModule],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
