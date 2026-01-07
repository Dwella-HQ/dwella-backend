import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLandlordDto {
  @IsUUID('all')
  userId: string;

  @IsString()
  @IsOptional()
  landLordName?: string;

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
}
