import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { VerificationStatusEnum } from 'src/utils/constants';

export class UpdateVerificationStatusDto {
  @IsEnum(VerificationStatusEnum)
  status: VerificationStatusEnum;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsUUID('all', { each: true })
  supportingDocumentIds: string[];
}
