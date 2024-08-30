import { IsString, IsOptional, IsIn } from 'class-validator';

export class ListMeasuresDto {
  @IsOptional()
  @IsString()
  @IsIn(['WATER', 'GAS'])
  measure_type?: string;
}
