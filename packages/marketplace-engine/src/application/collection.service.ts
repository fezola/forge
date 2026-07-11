import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICollectionRepository } from '../domain/repository-interfaces';
import type { MarketplaceCollection } from '@forge/marketplace-types';

@Injectable()
export class CollectionService {
  constructor(@Inject('ICollectionRepository') private readonly collectionRepo: ICollectionRepository) {}

  async findAll(featuredOnly?: boolean): Promise<MarketplaceCollection[]> {
    return this.collectionRepo.findAll(featuredOnly);
  }

  async findById(id: string): Promise<MarketplaceCollection> {
    const col = await this.collectionRepo.findById(id);
    if (!col) throw new NotFoundException('Collection not found');
    return col;
  }

  async create(data: { name: string; slug: string; description?: string; icon?: string; listingIds?: string[]; featured?: boolean; sortOrder?: number }): Promise<MarketplaceCollection> {
    return this.collectionRepo.create(data);
  }

  async update(id: string, data: Partial<MarketplaceCollection>): Promise<MarketplaceCollection> {
    await this.findById(id);
    return this.collectionRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.collectionRepo.delete(id);
  }
}
