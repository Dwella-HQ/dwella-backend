import { IsUUID } from 'class-validator';

export class AddLandlordDto {
  @IsUUID('all')
  landlordId: string;
}
