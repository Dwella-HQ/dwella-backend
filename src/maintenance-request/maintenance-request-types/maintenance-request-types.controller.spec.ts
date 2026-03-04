import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceRequestTypesController } from './maintenance-request-types.controller';
import { MaintenanceRequestTypesService } from './maintenance-request-types.service';

describe('MaintenanceRequestTypesController', () => {
  let controller: MaintenanceRequestTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceRequestTypesController],
      providers: [MaintenanceRequestTypesService],
    }).compile();

    controller = module.get<MaintenanceRequestTypesController>(MaintenanceRequestTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
