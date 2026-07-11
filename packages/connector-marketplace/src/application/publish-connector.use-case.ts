import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { IMarketplaceRepository } from '../domain/marketplace.repository.interface';
import { IManifestLoader } from '@forge/connector-registry';
import { MarketplaceEntryEntity } from '../domain/marketplace-entry.entity';

@Injectable()
export class PublishConnectorUseCase {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
    @Inject('IManifestLoader')
    private readonly loader: IManifestLoader,
  ) {}

  async execute(manifestId: string, icon?: string) {
    const manifest = await this.loader.load(manifestId);
    if (!manifest) throw new BadRequestException(`Connector "${manifestId}" not found`);

    const existing = await this.repo.findByManifestId(manifestId);
    if (existing) throw new ConflictException(`Connector "${manifest.name}" is already published`);

    const entry = MarketplaceEntryEntity.publish({
      manifestId: manifest.id,
      name: manifest.name,
      description: manifest.description,
      category: manifest.category,
      version: manifest.version,
      author: manifest.author,
      icon,
      tags: manifest.tags,
    });

    return this.repo.create(entry);
  }

  async unpublish(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
