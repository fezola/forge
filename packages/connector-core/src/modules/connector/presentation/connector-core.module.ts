import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { ConnectorService } from '../application/connector.service';
import { AxiosConnectorExecutor } from '../infrastructure/axios-connector-executor';
import { PrismaConnectorRepository } from '../infrastructure/prisma-connector.repository';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    ConnectorService,
    PrismaClient,
    { provide: 'IConnectorRepository', useClass: PrismaConnectorRepository },
    { provide: 'IConnectorExecutor', useClass: AxiosConnectorExecutor },
  ],
  exports: [ConnectorService],
})
export class ConnectorCoreModule {}
