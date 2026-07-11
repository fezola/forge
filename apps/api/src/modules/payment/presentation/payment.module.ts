import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PaymentEngineModule } from '@forge/payment-engine';
import { PaymentController } from './payment.controller';
import { PaymentFacade } from '../application/payment-facade';

@Module({
  imports: [PaymentEngineModule],
  controllers: [PaymentController],
  providers: [PaymentFacade, PrismaClient],
})
export class PaymentModule {}
