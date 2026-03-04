import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceRequestSubTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;
}
