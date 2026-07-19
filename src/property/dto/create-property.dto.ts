import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { CreateAddressDto } from 'src/utils/shared.dto';

export class CreatePropertyDto {
  @IsUUID('all')
  landlordId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @Length(4, 4)
  yearBuilt!: string;

  @IsNumber()
  numberOfUnits!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  parkingSpace!: boolean;

  @IsOptional()
  @IsUUID('all', { each: true })
  photoIds?: string[];

  @IsOptional()
  @IsUUID('all', { each: true })
  documentIds?: string[];

  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address!: CreateAddressDto;

  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}
