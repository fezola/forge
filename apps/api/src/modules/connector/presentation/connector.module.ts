import { Module } from '@nestjs/common';
import { ConnectorRuntimeModule } from '@forge/connector-runtime';
import { ConnectorRegistryModule } from '@forge/connector-registry';
import { ConnectorMarketplaceModule } from '@forge/connector-marketplace';
import { CustomConnectorModule } from '@forge/custom-connector';
import { SecretManagerModule } from '@forge/secret-manager';
import { ConnectorController } from './connector.controller';
import { ConnectorsController } from './connectors.controller';
import { ConnectorFacade } from '../application/connector.facade';

@Module({
  imports: [
    ConnectorRuntimeModule,
    ConnectorRegistryModule,
    ConnectorMarketplaceModule,
    CustomConnectorModule,
    SecretManagerModule,
  ],
  controllers: [ConnectorController, ConnectorsController],
  providers: [ConnectorFacade],
  exports: [ConnectorFacade],
})
export class ConnectorModule {}
