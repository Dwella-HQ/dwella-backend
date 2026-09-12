import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { PropertyModule } from 'src/property/property.module';
import { UserModule } from 'src/user/user.module';
import { TenantInvite } from './entities/tenant-invite.entity';
import { ContractModule } from 'src/contract/contract.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantInvite]),
    PropertyModule,
    UserModule,
    ContractModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
