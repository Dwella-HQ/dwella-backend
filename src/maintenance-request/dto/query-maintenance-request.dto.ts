import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  MaintenanceRequestLevel,
  MaintenanceRequestPriority,
  MaintenanceRequestStatus,
  MaintenanceRequestTypes,
} from 'src/utils/constants';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';

export class QueryMaintenanceRequestDto extends QueryPaginationDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsEnum(MaintenanceRequestLevel)
  @IsOptional()
  level?: MaintenanceRequestLevel;

  @IsEnum(MaintenanceRequestTypes)
  type: MaintenanceRequestTypes;

  @IsEnum(MaintenanceRequestPriority)
  priority: MaintenanceRequestPriority;

  @IsString()
  @IsNotEmpty()
  subType: string;

  @IsEnum(MaintenanceRequestStatus)
  status: MaintenanceRequestStatus;
}
