import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BankAccountDto, CreateAddressDto } from 'src/utils/shared.dto';

export class CreateLandlordDto {
  @IsUUID('all')
  userId!: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessEmail?: string;

  @IsUUID('all')
  @IsOptional()
  profilePictureId?: string;

  @IsUUID('all')
  @IsOptional()
  govermentIdDocumentId!: string;

  @IsUUID('all')
  @IsOptional()
  landSurveyDocumentId!: string;

  @IsUUID('all')
  @IsOptional()
  proofOfOwnershipDocumentId!: string;

  @IsUUID('all')
  @IsOptional()
  taxIdentificationNumberDocumentId!: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;

  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount!: BankAccountDto;
}
