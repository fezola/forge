import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { CustomConnectorService } from '../application/custom-connector.service';
import { EndpointTestService } from '../application/endpoint-test.service';
import { PrismaCustomConnectorRepository } from '../infrastructure/prisma-custom-connector.repository';
import { CustomConnectorController } from './custom-connector.controller';

@Module({
  imports: [HttpModule],
  providers: [
    CustomConnectorService,
    EndpointTestService,
    PrismaClient,
    { provide: 'ICustomConnectorRepository', useClass: PrismaCustomConnectorRepository },
  ],
  controllers: [CustomConnectorController],
  exports: [CustomConnectorService, EndpointTestService],
})
export class CustomConnectorModule {}
