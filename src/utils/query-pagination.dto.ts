import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class QueryPaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsDate()
  @IsOptional()
  cursor?: Date;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
