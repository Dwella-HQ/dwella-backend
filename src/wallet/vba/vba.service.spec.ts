import { Test, TestingModule } from '@nestjs/testing';
import { VbaService } from './vba.service';

describe('VbaService', () => {
  let service: VbaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VbaService],
    }).compile();

    service = module.get<VbaService>(VbaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
