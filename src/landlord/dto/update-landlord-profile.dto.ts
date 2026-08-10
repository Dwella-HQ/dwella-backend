import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/utils/shared.dto';

export class UpdateLandlordProfilePictureDto {
  @IsUUID()
  @IsNotEmpty()
  profilePictureId!: string;
}

export class UpdateLandlordProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  businessEmail?: string;

  @IsPhoneNumber()
  @IsOptional()
  businessPhoneNumber?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;
}
