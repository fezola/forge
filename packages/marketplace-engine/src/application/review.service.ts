import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IReviewRepository } from '../domain/repository-interfaces';
import type { MarketplaceReview } from '@forge/marketplace-types';

@Injectable()
export class ReviewService {
  constructor(@Inject('IReviewRepository') private readonly reviewRepo: IReviewRepository) {}

  async findByListing(listingId: string): Promise<MarketplaceReview[]> {
    return this.reviewRepo.findByListing(listingId);
  }

  async create(data: { listingId: string; authorId: string; authorName?: string; rating: number; title?: string; body?: string }): Promise<MarketplaceReview> {
    const existing = await this.reviewRepo.findByAuthor(data.listingId, data.authorId);
    if (existing) throw new BadRequestException('You have already reviewed this listing');
    if (data.rating < 1 || data.rating > 5) throw new BadRequestException('Rating must be between 1 and 5');
    return this.reviewRepo.create(data);
  }

  async approve(id: string): Promise<void> {
    const review = await this.reviewRepo.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.approve(id);
  }
}
