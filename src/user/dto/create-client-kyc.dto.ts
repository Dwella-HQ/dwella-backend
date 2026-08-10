import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IdTypeEnum } from 'src/utils/constants';

export class CreateClientKycDto {
  @IsUUID('all')
  userId!: string;

  @IsEnum(IdTypeEnum)
  idType!: IdTypeEnum;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsUUID('all')
  @IsOptional()
  idDocumentId?: string;

  @IsUUID('all')
  @IsOptional()
  proofOfAddressDocumentId?: string;

  @IsString()
  @IsNotEmpty()
  tinNumber!: string;

  @IsUUID('all')
  @IsOptional()
  tinDocumentId?: string;
}
