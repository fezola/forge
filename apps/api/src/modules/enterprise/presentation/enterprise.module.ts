import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseFacade } from '../application/enterprise-facade';

@Module({
  controllers: [EnterpriseController],
  providers: [EnterpriseFacade, PrismaClient],
})
export class EnterpriseModule {}
