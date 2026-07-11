export interface MarketplaceCollection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  listingIds: string[];
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
