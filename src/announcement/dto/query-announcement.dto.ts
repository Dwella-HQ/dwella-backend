import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AnnounementLevelEnum } from 'src/utils/constants';

export class QueryAnnouncementDto {
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID()
  @IsOptional()
  landlordId?: string;

  @IsEnum(AnnounementLevelEnum)
  @IsOptional()
  level?: AnnounementLevelEnum;
}
