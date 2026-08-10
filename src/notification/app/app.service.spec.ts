import { Test, TestingModule } from '@nestjs/testing';
import { AppNotificationService } from './app.service';

describe('AppService', () => {
  let service: AppNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppNotificationService],
    }).compile();

    service = module.get<AppNotificationService>(AppNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
