import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IListingRepository } from '../domain/repository-interfaces';
import type { MarketplaceListing, CreateListingRequest } from '@forge/marketplace-types';

@Injectable()
export class ListingService {
  constructor(@Inject('IListingRepository') private readonly listingRepo: IListingRepository) {}

  async findAll(filters?: { category?: string; type?: string; status?: string; featured?: boolean; verified?: boolean }): Promise<MarketplaceListing[]> {
    return this.listingRepo.findAll(filters);
  }

  async search(query: string): Promise<MarketplaceListing[]> {
    return this.listingRepo.search(query);
  }

  async findById(id: string): Promise<MarketplaceListing> {
    const listing = await this.listingRepo.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async findBySlug(slug: string): Promise<MarketplaceListing> {
    const listing = await this.listingRepo.findBySlug(slug);
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async create(data: CreateListingRequest & { authorId: string; authorName?: string }): Promise<MarketplaceListing> {
    return this.listingRepo.create(data as any);
  }

  async update(id: string, data: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
    await this.findById(id);
    return this.listingRepo.update(id, data);
  }

  async submit(id: string): Promise<void> {
    await this.findById(id);
    await this.listingRepo.submit(id);
  }

  async approve(id: string): Promise<void> {
    await this.findById(id);
    await this.listingRepo.approve(id);
  }

  async publish(id: string): Promise<void> {
    await this.findById(id);
    await this.listingRepo.publish(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.listingRepo.archive(id);
  }

  async getStats() {
    return this.listingRepo.getStats();
  }
}
