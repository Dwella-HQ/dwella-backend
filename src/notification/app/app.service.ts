import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppNotification } from './entities/app.entity';
import { Repository } from 'typeorm';
import { CreateAppNotificationDto } from './dto/create-app-notification.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { JOB_NAMES } from 'src/utils/constants';
import { Queue } from 'bullmq';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Injectable()
export class AppNotificationService {
  constructor(
    @InjectRepository(AppNotification)
    private readonly appNotificationRepository: Repository<AppNotification>,
    @InjectQueue(JOB_NAMES.APP_NOTIFICATION)
    private readonly appNotificationQueue: Queue,
  ) {}

  async createNotification(createAppNotificationDto: CreateAppNotificationDto) {
    await this.appNotificationQueue.add(
      'create-notification',
      createAppNotificationDto,
    );
  }

  async getNotification(id: string) {
    const notification = await this.appNotificationRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async getUserNotification(getNotificationDto: GetNotificationsDto) {
    await this.appNotificationQueue.add(
      'fetch-user-notifications',
      getNotificationDto,
    );
  }

  async readNotication(userId: string, notificationId: string) {
    await this.appNotificationQueue.add('read-notification', {
      userId,
      notificationId,
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    await this.appNotificationQueue.add('delete-notification', {
      userId,
      notificationId,
    });
  }
}
