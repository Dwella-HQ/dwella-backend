import { PartialType } from '@nestjs/swagger';
import { CreateMaintenanceRequestSubTypeDto } from './create-maintenance-request-subtype.dto';

export class UpdateMaintenanceRequestSubTypeDto extends PartialType(
  CreateMaintenanceRequestSubTypeDto,
) {}
