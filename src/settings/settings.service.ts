/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entity/settings.entity';
import { EnvironmentVariables } from 'src/config/env.config';
import { ConfigService } from '@nestjs/config';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import ms from 'ms';

@Injectable()
export class SettingsService {
  private settingsId?: string;
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly configService: ConfigService<EnvironmentVariables>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const key = 'settings';
    const cachedSettings = await this.cacheManager.get<Settings>(key);
    if (cachedSettings) {
      return value ? cachedSettings[value] : cachedSettings;
    }
    const settings = await this.settingsRepository.findOne({
      where: { id: this.settingsId },
    });
    await this.cacheManager.set(key, settings, ms('1w') / 1000);
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    if (value) {
      return settings[value];
    }
    return settings;
  }

  async updateSetting(updateSettingsDto: UpdateSettingsDto) {
    const key = 'settings';
    await this.cacheManager.del(key);
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
