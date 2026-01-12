import { IsOptional, IsString } from 'class-validator';

export class CreateAmenityDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
