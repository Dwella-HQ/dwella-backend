import { IsBoolean, IsDate, IsOptional, IsUUID } from 'class-validator';

export class QueryLeaseDto {
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID()
  @IsOptional()
  leaseId?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}
