import { PartialType } from '@nestjs/swagger';
import { CreateMaintenanceRequestTypeDto } from './create-maintenance-request-type.dto';

export class UpdateMaintenanceRequestTypeDto extends PartialType(
  CreateMaintenanceRequestTypeDto,
) {}
