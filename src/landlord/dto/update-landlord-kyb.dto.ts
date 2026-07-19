import { PartialType } from '@nestjs/swagger';
import { CreateLandlordKybDto } from './create-landlord-kyb.dto';

export class UpdateLandlordKybDto extends PartialType(CreateLandlordKybDto) {}
