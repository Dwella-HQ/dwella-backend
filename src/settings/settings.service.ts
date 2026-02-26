/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entity/settings.entity';
import { EnvironmentVariables } from 'src/config/env.config';
import { ConfigService } from '@nestjs/config';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private settingsId?: string;
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.settingsId = configService.get('SETTINGS_ID');
  }

  async createSettings() {
    let settings = await this.settingsRepository.findOne({
      where: { id: this.settingsId },
    });
    if (!settings) {
      settings = this.settingsRepository.create({ id: this.settingsId });
      return this.settingsRepository.save(settings);
    }
    return settings;
  }

  async getSetting(value?: keyof Settings) {
    const settings = await this.settingsRepository.findOne({
      where: { id: this.settingsId },
    });
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    if (value) {
      return settings[value];
    }
    return settings;
  }

  async updateSetting(updateSettingsDto: UpdateSettingsDto) {
    const settings = await this.settingsRepository.findOne({
      where: { id: this.settingsId },
    });
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    for (const key in updateSettingsDto) {
      if (updateSettingsDto[key] !== undefined) {
        settings[key] = updateSettingsDto[key];
      }
    }
    return this.settingsRepository.save(settings);
  }
}
