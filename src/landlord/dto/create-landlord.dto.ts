import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLandlordDto {
  @IsUUID('all')
  userId: string;

  @IsString()
  @IsOptional()
  landLordName?: string;

  @IsUUID('all')
  govermentIdDocumentId: string;

  @IsUUID('all')
  landSurveyDocumentId: string;

  @IsUUID('all')
  proofOfOwnershipDocumentId: string;

  @IsUUID('all')
  taxIdentificationNumberDocumentId: string;
}
