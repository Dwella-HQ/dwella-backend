import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';

export class QueryLandlordDto extends QueryPaginationDto {
  @IsUUID('all')
  @IsOptional()
  userId?: string;

  @IsUUID('all')
  @IsOptional()
  landlordId?: string;

  @IsString()
  @IsOptional()
  landLordName?: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
