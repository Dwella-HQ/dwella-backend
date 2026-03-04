import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceRequestTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;
}
