import type { MarketplaceListing, MarketplaceVersion, MarketplaceReview, MarketplaceInstall, MarketplaceCollection } from '@forge/marketplace-types';

export interface IListingRepository {
  findAll(filters?: { category?: string; type?: string; status?: string; featured?: boolean; verified?: boolean }): Promise<MarketplaceListing[]>;
  search(query: string): Promise<MarketplaceListing[]>;
  findById(id: string): Promise<MarketplaceListing | null>;
  findBySlug(slug: string): Promise<MarketplaceListing | null>;
  findByAuthor(authorId: string): Promise<MarketplaceListing[]>;
  create(data: { name: string; slug: string; tagline?: string; description?: string; category?: string; type?: string; icon?: string; authorId: string; authorName?: string; license?: string; tags?: string[]; docsUrl?: string; sourceUrl?: string; supportUrl?: string }): Promise<MarketplaceListing>;
  update(id: string, data: Partial<MarketplaceListing>): Promise<MarketplaceListing>;
  submit(id: string): Promise<void>;
  approve(id: string): Promise<void>;
  reject(id: string, reason?: string): Promise<void>;
  publish(id: string): Promise<void>;
  archive(id: string): Promise<void>;
  incrementInstallCount(id: string): Promise<void>;
  getStats(): Promise<{ totalListings: number; totalInstalls: number; totalReviews: number; topCategories: { category: string; count: number }[] }>;
}

export interface IVersionRepository {
  findByListing(listingId: string): Promise<MarketplaceVersion[]>;
  findById(id: string): Promise<MarketplaceVersion | null>;
  getLatest(listingId: string): Promise<MarketplaceVersion | null>;
  create(data: { listingId: string; version: string; changelog?: string; packageUrl?: string; sizeBytes?: number; minApiVersion?: string; maxApiVersion?: string; dependencies?: string[]; checksum?: string }): Promise<MarketplaceVersion>;
  publish(id: string): Promise<void>;
}

export interface IReviewRepository {
  findByListing(listingId: string): Promise<MarketplaceReview[]>;
  findById(id: string): Promise<MarketplaceReview | null>;
  findByAuthor(listingId: string, authorId: string): Promise<MarketplaceReview | null>;
  create(data: { listingId: string; authorId: string; authorName?: string; rating: number; title?: string; body?: string }): Promise<MarketplaceReview>;
  update(id: string, data: Partial<MarketplaceReview>): Promise<MarketplaceReview>;
  approve(id: string): Promise<void>;
  reject(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IInstallRepository {
  findByProject(projectId: string): Promise<MarketplaceInstall[]>;
  findByListing(listingId: string): Promise<MarketplaceInstall[]>;
  findInstall(listingId: string, projectId: string): Promise<MarketplaceInstall | null>;
  create(data: { listingId: string; projectId: string; version: string; config?: Record<string, unknown>; installedBy: string }): Promise<MarketplaceInstall>;
  update(id: string, data: Partial<MarketplaceInstall>): Promise<MarketplaceInstall>;
  remove(id: string): Promise<void>;
}

export interface ICollectionRepository {
  findAll(featuredOnly?: boolean): Promise<MarketplaceCollection[]>;
  findById(id: string): Promise<MarketplaceCollection | null>;
  findBySlug(slug: string): Promise<MarketplaceCollection | null>;
  create(data: { name: string; slug: string; description?: string; icon?: string; listingIds?: string[]; featured?: boolean; sortOrder?: number }): Promise<MarketplaceCollection>;
  update(id: string, data: Partial<MarketplaceCollection>): Promise<MarketplaceCollection>;
  delete(id: string): Promise<void>;
}
