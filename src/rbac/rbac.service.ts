import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async createPermission(
    name: string,
    description?: string,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({ name, description });
    return this.permissionRepository.save(permission);
  }

  async createRole(
    name: string,
    description?: string,
    permissionIds?: string[],
  ): Promise<Role> {
    const role = this.roleRepository.create({ name, description });

    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
      });
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async createRoleWithPermissions(
    name: string,
    description: string,
    permissionsData: { name: string; description?: string }[],
  ): Promise<Role> {
    const permissions: Permission[] = [];

    for (const permData of permissionsData) {
      const permission = await this.permissionRepository.findOne({
        where: { name: permData.name },
      });
      if (!permission) {
        const newPermission = this.permissionRepository.create(permData);
        const savedPermission =
          await this.permissionRepository.save(newPermission);
        permissions.push(savedPermission);
      } else {
        permissions.push(permission);
      }
    }

    const role = await this.roleRepository.findOne({
      where: { name },
    });

    if (role) {
      role.description = description;
      role.permissions = permissions;
      return this.roleRepository.save(role);
    } else {
      const newRole = this.roleRepository.create({
        name,
        description,
        permissions,
      });
      return this.roleRepository.save(newRole);
    }
  }

  async getAllRoles() {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async getAllPermissions() {
    return this.permissionRepository.find();
  }

  async getRoleById(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async getPermissionById(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async getRoleByName(name: string) {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async getPermissionByName(name: string) {
    const permission = await this.permissionRepository.findOne({
      where: { name },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) {
      throw new Error('Role not found');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    role.permissions = [...(role.permissions || []), ...permissions];
    return this.roleRepository.save(role);
  }

  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) {
      throw new Error('Role not found');
    }

    role.permissions = role.permissions.filter(
      (perm) => !permissionIds.includes(perm.id),
    );
    return this.roleRepository.save(role);
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.roleRepository.delete(roleId);
  }

  async deletePermission(permissionId: string): Promise<void> {
    await this.permissionRepository.delete(permissionId);
  }
}
