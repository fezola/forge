import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AiController } from './ai.controller';
import { AiFacade } from '../application/ai-facade';

@Module({
  controllers: [AiController],
  providers: [AiFacade, PrismaClient],
})
export class AiModule {}
