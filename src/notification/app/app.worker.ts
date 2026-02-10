import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { JOB_NAMES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { AppNotification } from './entities/app.entity';
import { AppNotificationGateway } from './app.gateway';
import { CreateAppNotificationDto } from './dto/create-app-notification.dto';
import { UserService } from 'src/user/user.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Processor(JOB_NAMES.APP_NOTIFICATION)
export class AppNotificationWorker extends WorkerHost {
  constructor(
    @InjectRepository(AppNotification)
    private readonly appNotificationRepository: Repository<AppNotification>,
    private readonly appNotificationGateway: AppNotificationGateway,
    private readonly userService: UserService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'create-notification': {
        const createAppNotificationDto = job.data as CreateAppNotificationDto;
        const user = await this.userService.findOne(
          createAppNotificationDto.userId,
        );
        await this.appNotificationRepository.save({
          user,
          ...createAppNotificationDto,
        });
        await this.sendUserNotifications({
          userId: createAppNotificationDto.userId,
        });
        return;
      }
      case 'fetch-notifications': {
        return;
      }
      case 'fetch-user-notifications': {
        const getNotificationDto = job.data as GetNotificationsDto;
        await this.sendUserNotifications(getNotificationDto);
        return;
      }
      case 'read-notification': {
        const { userId, notificationId } = job.data as {
          userId: string;
          notificationId: string;
        };
        const result = await this.appNotificationRepository.update(
          {
            id: notificationId,
            user: {
              id: userId,
            },
          },
          { isRead: true },
        );
        if (result.affected == 0) {
          throw new Error('Notification not found');
        }
        await this.sendUserNotifications({ userId });
        return;
      }
      case 'delete-notification': {
        const { userId, notificationId } = job.data as {
          userId: string;
          notificationId: string;
        };
        const result = await this.appNotificationRepository.delete({
          id: notificationId,
          user: {
            id: userId,
          },
        });
        if (result.affected == 0) {
          throw new Error('Notification not found');
        }
        await this.sendUserNotifications({ userId });
        return;
      }
      default: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unknown job name: ${job.name}`);
      }
    }
  }

  async sendUserNotifications(getUserNotificationsDto: GetNotificationsDto) {
    const { userId, isRead, limit = 10, cursor } = getUserNotificationsDto;
    const query = this.appNotificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (isRead !== undefined) {
      query.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (cursor) {
      query.andWhere('notification.createdAt < :cursor', { cursor });
    }

    const notifications = await query
      .orderBy('notification.createdAt', 'DESC')
      .take(limit)
      .getMany();
    void this.appNotificationGateway.emitToUser(userId, notifications);
  }
}
