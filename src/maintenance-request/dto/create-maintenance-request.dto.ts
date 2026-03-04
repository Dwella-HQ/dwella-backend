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
} from 'src/utils/constants';

export class CreateMaintenanceRequestDto {
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
  type: string;

  @IsEnum(MaintenanceRequestPriority)
  priority: MaintenanceRequestPriority;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  subType: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID('4', { each: true })
  @IsOptional()
  supportingFileIds?: string[];
}
