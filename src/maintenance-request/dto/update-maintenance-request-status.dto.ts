import { IsEnum } from 'class-validator';
import { MaintenanceRequestStatus } from 'src/utils/constants';

export class UpdateMaintenanceRequestStatusDto {
  @IsEnum(MaintenanceRequestStatus)
  status: MaintenanceRequestStatus;
}
