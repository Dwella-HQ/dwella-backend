import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class CreateLandlordDto {
  @IsUUID('all')
  userId: string;

  @IsString()
  @IsOptional()
  landLordName?: string;

  @IsString()
  @IsOptional()
  landLordEmail?: string;

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
