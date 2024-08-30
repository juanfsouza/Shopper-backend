import { IsString, IsDateString, IsIn, IsBase64 } from 'class-validator';

export class CreateMeasureDto {
  @IsBase64()
  image: string;

  @IsString()
  customer_code: string;

  @IsDateString()
  measure_datetime: string;

  @IsIn(['WATER', 'GAS'])
  measure_type: string;
}