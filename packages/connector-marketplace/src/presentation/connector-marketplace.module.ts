import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConnectorRegistryModule } from '@forge/connector-registry';
import { ConnectorMarketplaceService } from '../application/connector-marketplace.service';
import { BrowseConnectorsUseCase } from '../application/browse-connectors.use-case';
import { PublishConnectorUseCase } from '../application/publish-connector.use-case';
import { PrismaMarketplaceRepository } from '../infrastructure/prisma-marketplace.repository';
import { MarketplaceController } from './marketplace.controller';

@Module({
  imports: [ConnectorRegistryModule],
  providers: [
    ConnectorMarketplaceService,
    BrowseConnectorsUseCase,
    PublishConnectorUseCase,
    PrismaClient,
    { provide: 'IMarketplaceRepository', useClass: PrismaMarketplaceRepository },
  ],
  controllers: [MarketplaceController],
  exports: [ConnectorMarketplaceService],
})
export class ConnectorMarketplaceModule {}
