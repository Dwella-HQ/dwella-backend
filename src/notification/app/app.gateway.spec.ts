import { Test, TestingModule } from '@nestjs/testing';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';

describe('AppGateway', () => {
  let gateway: AppGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppGateway, AppService],
    }).compile();

    gateway = module.get<AppGateway>(AppGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
