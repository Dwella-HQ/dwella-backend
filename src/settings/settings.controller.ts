import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  async getSetting() {
    const settings = await this.settingsService.getSetting();
    return {
      success: true,
      message: 'Settings retrieved successfully',
      data: settings,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_SETTINGS)
  @Patch('update')
  async updateSetting(@Body() updateSettingsDto: UpdateSettingsDto) {
    const updatedSettings =
      await this.settingsService.updateSetting(updateSettingsDto);
    return {
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
    };
  }
}
