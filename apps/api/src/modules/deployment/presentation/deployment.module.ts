import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeploymentController } from './deployment.controller';
import { DeploymentFacade } from '../application/deployment-facade';

@Module({
  controllers: [DeploymentController],
  providers: [DeploymentFacade, PrismaClient],
})
export class DeploymentModule {}
