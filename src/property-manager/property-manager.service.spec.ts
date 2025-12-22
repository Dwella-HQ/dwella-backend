import { Test, TestingModule } from '@nestjs/testing';
import { PropertyManagerService } from './property-manager.service';

describe('PropertyManagerService', () => {
  let service: PropertyManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyManagerService],
    }).compile();

    service = module.get<PropertyManagerService>(PropertyManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
