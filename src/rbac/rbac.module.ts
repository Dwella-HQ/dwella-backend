import { Global, Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { PermissionsGuard } from './guards/permission.guard';
import { RolesGuard } from './guards/role.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard, RolesGuard],
  exports: [RbacService, PermissionsGuard, RolesGuard],
})
export class RbacModule {}
