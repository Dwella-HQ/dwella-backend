import { Type } from 'class-transformer';
import {
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class CreateLandlordDto {
  @IsUUID('all')
  userId: string;

  @IsString()
  @IsOptional()
  landLordName?: string;

  @IsNumberString()
  @Length(11, 11)
  bvn: string;

  @IsUUID('all')
  @IsOptional()
  profilePictureId: string;

  //TODO remove optional fields from documents
  @IsUUID('all')
  @IsOptional()
  govermentIdDocumentId: string;

  @IsUUID('all')
  @IsOptional()
  landSurveyDocumentId: string;

  @IsUUID('all')
  @IsOptional()
  proofOfOwnershipDocumentId: string;

  @IsUUID('all')
  @IsOptional()
  taxIdentificationNumberDocumentId: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
