import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  MaintenanceRequestPriority,
  MaintenanceRequestStatus,
} from 'src/utils/constants';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';

export class QueryMaintenanceRequestsDto extends QueryPaginationDto {
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsEnum(MaintenanceRequestStatus)
  @IsOptional()
  status?: MaintenanceRequestStatus;

  @IsEnum(MaintenanceRequestPriority)
  @IsOptional()
  priority?: MaintenanceRequestPriority;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  subType?: string;
}
