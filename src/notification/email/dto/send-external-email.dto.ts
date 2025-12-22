import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendExternalEmailDto {
  @IsString()
  @IsNotEmpty()
  recipientEmail: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsOptional()
  @IsNotEmptyObject()
  context: Record<string, any>;
}
