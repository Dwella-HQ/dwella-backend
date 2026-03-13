import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class UpdateLandlordProfilePictureDto {
  @IsUUID()
  profilePictureId: string;
}

export class UpdateLadlordProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  businessEmail: string;

  @IsPhoneNumber()
  @IsOptional()
  businessPhoneNumber?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
