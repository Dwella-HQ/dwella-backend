import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsUUID('all', { each: true })
  fileIds!: string[];

  @IsUUID('all', { each: true })
  @IsOptional()
  propertyIds!: string[];
}
