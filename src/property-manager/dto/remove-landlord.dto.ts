import { IsUUID } from 'class-validator';

export class RemoveLandlordDto {
  @IsUUID('all')
  landlordId: string;
}
