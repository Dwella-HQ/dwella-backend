import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import {
  CreateRoleDto,
  CreateRoleWithPermissionsDto,
} from './dto/create-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from './guards/permission.guard';
import { RequirePermissions } from './decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@ApiBearerAuth()
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @RequirePermissions(PERMISSIONS.CREATE_PERMISSION)
  @Post('permission')
  async createPermission(@Body() body: { name: string; description?: string }) {
    const permission = await this.rbacService.createPermission(
      body.name,
      body.description,
    );
    return {
      success: true,
      message: 'Permission created successfully',
      data: permission,
    };
  }

  @RequirePermissions(PERMISSIONS.CREATE_ROLE)
  @Post('roles')
  async createRole(
    @Body()
    body: CreateRoleDto,
  ) {
    const role = await this.rbacService.createRole(
      body.name,
      body.description,
      body.permissionIds,
    );
    return {
      success: true,
      message: 'Role created successfully',
      data: role,
    };
  }

  @RequirePermissions(PERMISSIONS.CREATE_ROLE)
  @Post('roles/with-permissions')
  async createRoleWithPermissions(
    @Body()
    body: CreateRoleWithPermissionsDto,
  ) {
    const role = await this.rbacService.createRoleWithPermissions(
      body.name,
      body.description,
      body.permissions,
    );
    return {
      success: true,
      message: 'Role with permissions created successfully',
      data: role,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_ROLE)
  @Get('roles')
  async getAllRoles() {
    const roles = await this.rbacService.getAllRoles();
    return {
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PERMISSION)
  @Get('permissions')
  async getAllPermissions() {
    const permissions = await this.rbacService.getAllPermissions();
    return {
      success: true,
      message: 'Permissions retrieved successfully',
      data: permissions,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_ROLE)
  @Get('roles/:id')
  async getRoleById(@Param('id') id: string) {
    const role = await this.rbacService.getRoleById(id);
    return {
      success: true,
      message: 'Role retrieved successfully',
      data: role,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PERMISSION)
  @Get('permissions/:id')
  async getPermissionById(@Param('id') id: string) {
    const permission = await this.rbacService.getPermissionById(id);
    return {
      success: true,
      message: 'Permission retrieved successfully',
      data: permission,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_ROLE)
  @Post('roles/:roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] },
  ) {
    const role = await this.rbacService.assignPermissionsToRole(
      roleId,
      body.permissionIds,
    );
    return {
      success: true,
      message: 'Permissions assigned to role successfully',
      data: role,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_ROLE)
  @Delete('roles/:roleId/permissions')
  async removePermissionsFromRole(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] },
  ) {
    const role = await this.rbacService.removePermissionsFromRole(
      roleId,
      body.permissionIds,
    );
    return {
      success: true,
      message: 'Permissions removed from role successfully',
      data: role,
    };
  }

  @RequirePermissions(PERMISSIONS.DELETE_ROLE)
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    await this.rbacService.deleteRole(id);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }

  @RequirePermissions(PERMISSIONS.DELETE_PERMISSION)
  @Delete('permissions/:id')
  async deletePermission(@Param('id') id: string) {
    await this.rbacService.deletePermission(id);
    return {
      success: true,
      message: 'Permission deleted successfully',
    };
  }
}
