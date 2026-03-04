import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceRequestTypesService } from './maintenance-request-types.service';

describe('MaintenanceRequestTypesService', () => {
  let service: MaintenanceRequestTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceRequestTypesService],
    }).compile();

    service = module.get<MaintenanceRequestTypesService>(MaintenanceRequestTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
