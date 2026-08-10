import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateClientKycDto } from './create-client-kyc.dto';

export class UpdateClientKycDto extends PartialType(
  OmitType(CreateClientKycDto, ['userId'] as const),
) {}
