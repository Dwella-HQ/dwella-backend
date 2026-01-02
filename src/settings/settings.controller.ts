import { Controller, Get, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @RequirePermissions(PERMISSIONS.MANAGE_SETTINGS)
  @Get()
  getSetting() {
    const settings = this.settingsService.getSetting();
    return {
      message: 'Settings retrieved successfully',
      data: settings,
    };
  }
}
