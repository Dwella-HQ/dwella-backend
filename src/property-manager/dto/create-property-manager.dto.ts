import { IsEnum, IsUUID } from 'class-validator';
import { PERMISSIONS } from 'src/utils/constants';

export class CreatePropertyManagerDto {
  @IsUUID('all')
  userId: string;

  @IsUUID('all')
  landlordId: string;

  @IsUUID('all', { each: true })
  propertyIds: string[];

  @IsEnum(
    [
      PERMISSIONS.MANAGE_CHAT,
      PERMISSIONS.MANAGE_MAINTENANCE_REQUESTS,
      PERMISSIONS.READ_PAYMENT,
    ],
    { each: true },
  )
  permissions: PERMISSIONS[];
}
