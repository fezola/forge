import { Injectable } from '@nestjs/common';
import { BrowseConnectorsUseCase } from './browse-connectors.use-case';
import { PublishConnectorUseCase } from './publish-connector.use-case';
import { InstallConnectorUseCase } from '@forge/connector-registry';

@Injectable()
export class ConnectorMarketplaceService {
  constructor(
    private readonly browse: BrowseConnectorsUseCase,
    private readonly publish: PublishConnectorUseCase,
    private readonly install: InstallConnectorUseCase,
  ) {}

  async browse(query?: string, category?: string, page?: number, limit?: number) {
    return this.browse.execute(query, category, page, limit);
  }

  async getListing(id: string) {
    return this.browse.getById(id);
  }

  async getByCategory(category: string) {
    return this.browse.getByCategory(category);
  }

  async publish(manifestId: string, icon?: string) {
    return this.publish.execute(manifestId, icon);
  }

  async unpublish(id: string) {
    return this.publish.unpublish(id);
  }

  async install(projectId: string, marketplaceId: string, config?: Record<string, unknown>) {
    const listing = await this.browse.getById(marketplaceId);
    if (!listing) throw new Error('Connector not found in marketplace');

    const installation = await this.install.execute(projectId, listing.manifestId, config);
    return installation;
  }
}
