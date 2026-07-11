export interface MarketplaceListing {
  id: string;
  manifestId: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  icon?: string;
  downloads: number;
  rating: number;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
}

export interface MarketplaceSearchParams {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}
