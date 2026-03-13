import { IsOptional, IsUUID } from 'class-validator';

export class UploadLandlordDocumentsDto {
  //TODO remove optional fields from documents
  @IsUUID()
  @IsOptional()
  govermentIdDocumentId: string;

  @IsUUID()
  @IsOptional()
  landSurveyDocumentId: string;

  @IsUUID()
  @IsOptional()
  proofOfOwnershipDocumentId: string;

  @IsUUID()
  @IsOptional()
  taxIdentificationNumberDocumentId: string;
}
