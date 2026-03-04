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

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type: string;

  @IsEnum(MaintenanceRequestPriority)
  @IsOptional()
  priority: MaintenanceRequestPriority;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  subType: string;

  @IsEnum(MaintenanceRequestStatus)
  @IsOptional()
  status: MaintenanceRequestStatus;
}
