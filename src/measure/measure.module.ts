import { Module } from '@nestjs/common';
import { MeasureController } from './measure.controller';
import { MeasureService } from './measure.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeasureController],
  providers: [MeasureService],
  exports: [MeasureService],
})
export class MeasureModule {}
