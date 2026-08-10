import { IsNumberString, Length } from 'class-validator';

export class CreateVBADto {
  @IsNumberString()
  @Length(11, 11)
  bvn: string;
}
