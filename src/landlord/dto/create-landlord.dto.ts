import { IsUUID } from 'class-validator';
export class CreateLandlordDto {
  @IsUUID('all')
  userId!: string;
}
