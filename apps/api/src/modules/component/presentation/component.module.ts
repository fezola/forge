import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ComponentController } from './component.controller';
import { ComponentFacade } from '../application/component-facade';

@Module({
  controllers: [ComponentController],
  providers: [ComponentFacade, PrismaClient],
})
export class ComponentModule {}
