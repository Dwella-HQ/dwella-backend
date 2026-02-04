import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { VerificationStatusEnum } from 'src/utils/constants';

export class UpdateVerificationStatusDto {
  @IsEnum(VerificationStatusEnum)
  status: VerificationStatusEnum;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason?: string;

  @IsUUID('all', { each: true })
  @IsOptional()
  supportingDocumentIds?: string[];
}
