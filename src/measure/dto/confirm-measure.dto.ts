import { IsString, IsInt } from 'class-validator';

export class ConfirmMeasureDto {
  @IsString()
  measure_uuid: string;

  @IsInt()
  confirmed_value: number;
}
