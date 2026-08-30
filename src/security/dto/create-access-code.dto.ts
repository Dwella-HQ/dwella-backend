import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccessCodeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
