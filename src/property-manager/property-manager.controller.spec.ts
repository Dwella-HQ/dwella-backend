import { Test, TestingModule } from '@nestjs/testing';
import { PropertyManagerController } from './property-manager.controller';
import { PropertyManagerService } from './property-manager.service';

describe('PropertyManagerController', () => {
  let controller: PropertyManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyManagerController],
      providers: [PropertyManagerService],
    }).compile();

    controller = module.get<PropertyManagerController>(
      PropertyManagerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
