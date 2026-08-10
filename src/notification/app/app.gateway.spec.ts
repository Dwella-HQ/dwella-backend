import { Test, TestingModule } from '@nestjs/testing';
import { AppNotificationService } from './app.service';
import { AppNotificationGateway } from './app.gateway';

describe('AppNotificationGateway', () => {
  let gateway: AppNotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppNotificationGateway, AppNotificationService],
    }).compile();

    gateway = module.get<AppNotificationGateway>(AppNotificationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
