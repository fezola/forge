import type { MarketplaceListing } from './listing.types';

export interface MarketplaceSearchResult {
  listings: MarketplaceListing[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MarketplaceSearchFilters {
  category?: string;
  type?: string;
  tags?: string[];
  sort?: 'popular' | 'recent' | 'rating' | 'name';
  page?: number;
  pageSize?: number;
}

export interface MarketplaceStats {
  totalListings: number;
  totalInstalls: number;
  totalReviews: number;
  topCategories: { category: string; count: number }[];
  recentListings: MarketplaceListing[];
  featuredListings: MarketplaceListing[];
}
