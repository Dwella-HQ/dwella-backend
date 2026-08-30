import { IsUUID } from 'class-validator';

export class AssignSecurityDto {
  @IsUUID()
  securityId!: string;
}
