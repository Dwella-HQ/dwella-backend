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
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class CreatePropertyDto {
  @IsUUID()
  landlordId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Length(4, 4)
  yearBuilt: number;

  @IsNumber()
  numberOfUnits: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  parkingSpace: boolean;

  @IsOptional()
  @IsUUID('all', { each: true })
  photoIds?: string[];

  @IsOptional()
  @IsUUID('all', { each: true })
  documentIds?: string[];

  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address: CreateAddressDto;
}
