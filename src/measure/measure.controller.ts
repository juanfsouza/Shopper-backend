import { Controller, Post, Patch, Get, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MeasureService } from './measure.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { ListMeasuresDto } from './dto/list-measures.dto';

@Controller('measures')
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  // Endpoint para upload de imagem e criação de medição
  @Post('upload')
  async uploadImage(@Body() createMeasureDto: CreateMeasureDto) {
    try {
      const measure = await this.measureService.createMeasure(createMeasureDto);
      return {
        image_url: measure.imageUrl,
        measure_value: measure.measureValue,
        measure_uuid: measure.measureUuid,
      };
    } catch (error) {
      console.error('Error uploading:', error);
      throw new HttpException({
        error_code: error.response?.data?.error_code || 'UNKNOWN_ERROR',
        error_description: error.response?.data?.error_description || 'Ocorreu um erro',
      }, HttpStatus.BAD_REQUEST);
    }
  }  

  // Endpoint para confirmação de medição
  @Patch('confirm')
  async confirmMeasure(@Body() confirmMeasureDto: ConfirmMeasureDto) {
    try {
      return await this.measureService.confirmMeasure(confirmMeasureDto);
    } catch (error) {
      // Melhorando o tratamento de erros
      throw new HttpException({
        error_code: error?.response?.data?.error_code || 'UNKNOWN_ERROR',
        error_description: error?.response?.data?.error_description || 'Ocorreu um erro ao confirmar a medição',
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // Endpoint para listar medições
  @Get(':customer_code/list')
  async listMeasures(@Param('customer_code') customer_code: string, @Query() query: ListMeasuresDto) {
    try {
      return await this.measureService.listMeasures(customer_code, query);
    } catch (error) {
      throw new HttpException({
        error_code: error?.response?.data?.error_code || 'UNKNOWN_ERROR',
        error_description: error?.response?.data?.error_description || 'Ocorreu um erro ao confirmar a medição',
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
