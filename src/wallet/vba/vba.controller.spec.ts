import { Test, TestingModule } from '@nestjs/testing';
import { VbaController } from './vba.controller';
import { VbaService } from './vba.service';

describe('VbaController', () => {
  let controller: VbaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VbaController],
      providers: [VbaService],
    }).compile();

    controller = module.get<VbaController>(VbaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
