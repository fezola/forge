export interface MarketplaceVersion {
  id: string;
  listingId: string;
  version: string;
  changelog?: string | null;
  packageUrl?: string | null;
  sizeBytes?: number | null;
  minApiVersion?: string | null;
  maxApiVersion?: string | null;
  dependencies: string[];
  checksum?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
}
