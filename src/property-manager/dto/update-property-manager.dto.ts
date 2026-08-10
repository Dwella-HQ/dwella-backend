import { PartialType } from '@nestjs/swagger';
import { CreatePropertyManagerDto } from './create-property-manager.dto';

export class UpdatePropertyManagerDto extends PartialType(
  CreatePropertyManagerDto,
) {}
