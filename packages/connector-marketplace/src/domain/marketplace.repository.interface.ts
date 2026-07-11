import { MarketplaceEntryEntity } from './marketplace-entry.entity';

export interface IMarketplaceRepository {
  findById(id: string): Promise<MarketplaceEntryEntity | null>;
  findByManifestId(manifestId: string): Promise<MarketplaceEntryEntity | null>;
  search(query: string, category?: string, page?: number, limit?: number): Promise<{ items: MarketplaceEntryEntity[]; total: number }>;
  listByCategory(category: string): Promise<MarketplaceEntryEntity[]>;
  listAll(page?: number, limit?: number): Promise<{ items: MarketplaceEntryEntity[]; total: number }>;
  create(entry: MarketplaceEntryEntity): Promise<MarketplaceEntryEntity>;
  update(id: string, data: Partial<MarketplaceEntryEntity>): Promise<MarketplaceEntryEntity>;
  delete(id: string): Promise<void>;
  incrementDownloads(id: string): Promise<void>;
}
