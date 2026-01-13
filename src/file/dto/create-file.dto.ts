import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  folder: string;

  file: Express.Multer.File;
}
