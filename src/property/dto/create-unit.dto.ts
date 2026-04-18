import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsUUID('all', { each: true })
  @IsOptional()
  imageIds?: string[];
}
