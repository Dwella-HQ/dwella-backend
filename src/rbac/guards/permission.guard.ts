/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/entities/user.entity';
import { RbacService } from '../rbac.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = (request as any).user;

    if (!user || !user.role) {
      return false;
    }

    const role = await this.rbacService.getRoleById(user.role.id);
    const userPermissions = role.permissions.map((p) => p.name);

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
