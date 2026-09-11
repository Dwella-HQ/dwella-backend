import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Property } from 'src/property/entities/property.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { PropertyManager } from 'src/property-manager/entities/property-manager.entity';
import { Security } from 'src/security/entities/security-property.entity';
import { Lease } from 'src/tenant/entities/lease.entity';
import { PropertyAccessGuard } from './property-access.guard';
import { PropertyAccessService } from './property-access.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      Unit,
      Lease,
      PropertyManager,
      Security,
      Landlord,
    ]),
  ],
  providers: [PropertyAccessService, PropertyAccessGuard],
  exports: [PropertyAccessService, PropertyAccessGuard],
})
export class PropertyAccessModule {}
