import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/utils/shared.dto';

export class CreateLandlordKybDto {
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsEmail()
  businessEmail!: string;

  @IsPhoneNumber()
  businessPhoneNumber!: string;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsOptional()
  businessAddress?: CreateAddressDto;

  @IsUUID('all')
  businessLogoId!: string;

  @IsUUID('all')
  businessCacCertificateId!: string;

  @IsUUID('all')
  @IsOptional()
  businessTinCertificateId?: string;

  @IsString()
  @IsOptional()
  businessTinNumber?: string;

  @IsUUID('all')
  @IsOptional()
  businessProofOfAddressId?: string;
}
