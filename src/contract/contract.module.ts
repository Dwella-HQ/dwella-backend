import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { GuestService } from './guest.service';
import { Contract } from './entities/contract.entity';
import { Guest } from './entities/guest.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { PropertyModule } from 'src/property/property.module';

@Module({
  imports: [
    // `Tenant` is registered here only for read-only id lookups — `TenantModule`
    // is not imported to avoid a `TenantModule <-> ContractModule` circular
    // dependency (`TenantModule` imports `ContractModule` for `ContractService`).
    TypeOrmModule.forFeature([Contract, Guest, Tenant]),
    PropertyModule,
  ],
  controllers: [ContractController],
  providers: [ContractService, GuestService],
  exports: [ContractService, GuestService],
})
export class ContractModule {}
