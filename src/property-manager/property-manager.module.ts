import { Module } from '@nestjs/common';
import { PropertyManagerService } from './property-manager.service';
import { PropertyManagerController } from './property-manager.controller';
import { PropertyManager } from './entities/property-manager.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { LandlordModule } from 'src/landlord/landlord.module';
import { PropertyModule } from 'src/property/property.module';
import { PropertyManagerInvite } from './entities/property-manager-invite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyManager, PropertyManagerInvite]),
    UserModule,
    LandlordModule,
    PropertyModule,
  ],
  controllers: [PropertyManagerController],
  providers: [PropertyManagerService],
})
export class PropertyManagerModule {}
