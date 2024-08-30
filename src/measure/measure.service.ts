import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { ListMeasuresDto } from './dto/list-measures.dto';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class MeasureService {
  private readonly logger = new Logger(MeasureService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Criar nova medição
  async createMeasure(createMeasureDto: CreateMeasureDto) {
    const { image, customer_code, measure_datetime, measure_type } = createMeasureDto;

    // Verificar se já existe uma leitura para o cliente e tipo de medição no mês atual
    const existingMeasure = await this.prisma.measure.findFirst({
      where: {
        customerCode: customer_code,
        measureType: measure_type,
        measureDatetime: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    });

    if (existingMeasure) {
      throw new HttpException('Leitura do mês já realizada', HttpStatus.CONFLICT);
    }

    // Enviar imagem para a API do Google Vision
    const apiResponse = await this.analyzeImage(image);

    const { image_url, measure_uuid, measure_value } = apiResponse.responses[0].labelAnnotations;

    // Salvar a medição no banco de dados
    const measure = await this.prisma.measure.create({
      data: {
        customerCode: customer_code,
        measureDatetime: new Date(measure_datetime),
        measureType: measure_type,
        imageUrl: image_url,
        measureUuid: measure_uuid,
        measureValue: measure_value,
      },
    });

    return measure;
  }

  private async analyzeImage(image: string) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiEndpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const requestBody = {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10,
            },
          ],
        },
      ],
    };

    try {
      const response: AxiosResponse = await axios.post(apiEndpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('Response API:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Error na API request:', error.response?.data || error.message);
      throw new HttpException('Falha upar imagem', HttpStatus.BAD_REQUEST);
    }
  }

  // Confirmar medição
  async confirmMeasure(confirmMeasureDto: ConfirmMeasureDto) {
    const { measure_uuid, confirmed_value } = confirmMeasureDto;

    const measure = await this.prisma.measure.findUnique({
      where: { measureUuid: measure_uuid },
    });

    if (!measure) {
      throw new HttpException('Leitura não encontrada', HttpStatus.NOT_FOUND);
    }

    if (measure.confirmed) {
      throw new HttpException('Leitura já confirmada', HttpStatus.CONFLICT);
    }

    await this.prisma.measure.update({
      where: { measureUuid: measure_uuid },
      data: {
        confirmedValue: confirmed_value,
        confirmed: true,
      },
    });

    return { success: true };
  }

  // Listar medições
  async listMeasures(customer_code: string, listMeasuresDto: ListMeasuresDto) {
    const { measure_type } = listMeasuresDto;

    const whereCondition = {
      customerCode: customer_code,
      ...(measure_type && { measureType: measure_type.toUpperCase() }),
    };

    const measures = await this.prisma.measure.findMany({
      where: whereCondition,
    });

    if (measures.length === 0) {
      throw new HttpException('Nenhuma leitura encontrada', HttpStatus.NOT_FOUND);
    }

    this.logger.log('Lista measure criada com sucesso');
    return {
      customer_code,
      measures: measures.map(measure => ({
        measure_uuid: measure.measureUuid,
        measure_datetime: measure.measureDatetime,
        measure_type: measure.measureType,
        has_confirmed: measure.confirmed,
        image_url: measure.imageUrl,
      })),
    };
  }
}
