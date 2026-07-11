export interface MarketplaceListing {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  category: string;
  type: ListingType;
  icon?: string | null;
  banner?: string | null;
  authorId: string;
  authorName?: string | null;
  organizationId?: string | null;
  license?: string | null;
  tags: string[];
  status: ListingStatus;
  featured: boolean;
  verified: boolean;
  installCount: number;
  rating?: number | null;
  reviewCount: number;
  docsUrl?: string | null;
  sourceUrl?: string | null;
  supportUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ListingType = 'free' | 'paid' | 'freemium';
export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'archived';

export interface CreateListingRequest {
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category?: string;
  type?: ListingType;
  icon?: string;
  tags?: string[];
  license?: string;
  docsUrl?: string;
  sourceUrl?: string;
  supportUrl?: string;
}
