import { IsEnum, IsOptional } from 'class-validator';
import { ServiceOfferingTypeEnum } from 'src/utils/constants';

export class QueryPropertyUnitDto {
  @IsOptional()
  @IsEnum(ServiceOfferingTypeEnum)
  serviceOfferingType?: ServiceOfferingTypeEnum;
}
