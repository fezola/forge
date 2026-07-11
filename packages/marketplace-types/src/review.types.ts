export interface MarketplaceReview {
  id: string;
  listingId: string;
  authorId: string;
  authorName?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
