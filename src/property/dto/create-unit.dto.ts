import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  rentAmount: number;

  @IsNumber()
  numberOfBedrooms: number;

  @IsNumber()
  numberOfBathrooms: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
