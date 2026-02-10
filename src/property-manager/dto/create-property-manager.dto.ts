import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class CreatePropertyManagerDto {
  @IsUUID('all')
  userId: string;

  @IsUUID('all')
  @IsOptional()
  profilePictureId: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
