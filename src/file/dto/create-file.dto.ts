import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsUUID()
  ownerId: string;

  file: Express.Multer.File;
}
