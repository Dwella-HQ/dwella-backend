import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { RbacService } from 'src/rbac/rbac.service';
import { SettingsService } from 'src/settings/settings.service';
import { UserService } from 'src/user/user.service';
import { PERMISSIONS, USER_ROLES } from 'src/utils/constants';

@Injectable()
export class SeederService implements OnModuleInit {
  private logger = new Logger(SeederService.name);
  constructor(
    private readonly rbacService: RbacService,
    private readonly userService: UserService,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdminUser();
    await this.seedSettings();
  }

  private async seedPermissions() {
    const permissionsData = Object.values(PERMISSIONS);
    for (const perm of permissionsData) {
      try {
        const permission = await this.rbacService.createPermission(
          perm,
          `Permission to ${perm.replace(/_/g, ' ')}`,
        );
        this.logger.log(`Added permission: ${permission.name}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Handle duplicate permission error or other errors
        // console.log(`Permission ${perm} might already exist. Skipping...`);
      }
    }
  }

  private async seedRoles() {
    const rolesData: Record<string, PERMISSIONS[]> = {
      [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
      [USER_ROLES.ADMIN]: [
        PERMISSIONS.APPROVE_LANDLORD,
        PERMISSIONS.APPROVE_PROPERTY,
        PERMISSIONS.CREATE_LANDLORD,
        PERMISSIONS.CREATE_PERMISSION,
        PERMISSIONS.CREATE_PROPERTY,
        PERMISSIONS.CREATE_ROLE,
        PERMISSIONS.DELETE_LANDLORD,
        PERMISSIONS.DELETE_PERMISSION,
        PERMISSIONS.DELETE_PROPERTY,
        PERMISSIONS.DELETE_ROLE,
        PERMISSIONS.READ_LANDLORD,
        PERMISSIONS.READ_PERMISSION,
        PERMISSIONS.READ_PROPERTY,
        PERMISSIONS.READ_ROLE,
        PERMISSIONS.UPDATE_LANDLORD,
        PERMISSIONS.UPDATE_PERMISSION,
        PERMISSIONS.UPDATE_PROPERTY,
        PERMISSIONS.UPDATE_ROLE,
        PERMISSIONS.MANAGE_WALLET,
        PERMISSIONS.MANAGE_SETTINGS,
      ],
      [USER_ROLES.SUB_ADMIN]: [],
      [USER_ROLES.LANDLORD]: [
        PERMISSIONS.CREATE_LANDLORD,
        PERMISSIONS.CREATE_PROPERTY,
        PERMISSIONS.READ_PROPERTY,
        PERMISSIONS.UPDATE_PROPERTY,
        PERMISSIONS.DELETE_PROPERTY,
      ],
    };
    for (const [roleName, perms] of Object.entries(rolesData)) {
      const permissionsData = perms.map((perm) => ({
        name: perm,
        description: `Permission to ${perm.replace(/_/g, ' ')}`,
      }));
      const role = await this.rbacService.createRoleWithPermissions(
        roleName,
        `Role of ${roleName.replace(/_/g, ' ')}`,
        permissionsData,
      );
      this.logger.log(`Created role: ${role.name}`);
    }
  }

  private async seedAdminUser() {
    const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    const superAdminPassword = this.configService.get<string>(
      'SUPER_ADMIN_PASSWORD',
    );
    try {
      const existingAdmin = await this.userService
        .findOneByEmail(superAdminEmail!)
        .catch(() => null);
      if (existingAdmin) {
        return;
      }
      const role = await this.rbacService.getRoleByName(USER_ROLES.SUPER_ADMIN);
      const adminUser = await this.userService.create({
        email: superAdminEmail!,
        password: superAdminPassword!,
        fullName: 'Super Admin',
        roleName: role.name,
      });
      adminUser.isEmailVerified = true;
      await adminUser.save();
      this.logger.log(
        `Super admin user created with email: ${adminUser.email}`,
      );
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to create super admin user: ${error.message}`);
    }
  }

  private async seedSettings() {
    try {
      const settings = await this.settingsService.createSettings();
      this.logger.log('Settings Created Successfully', settings);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // console.error('Error creating settings:', error);
    }
  }
}
