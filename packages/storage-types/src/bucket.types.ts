export type BucketVisibility = 'public' | 'private';

export type BucketStatus = 'active' | 'inactive' | 'archived';

export interface BucketDefinition {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  description?: string;
  visibility: BucketVisibility;
  status: BucketStatus;
  providerId: string;
  region?: string;
  maxFileSizeBytes: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  versioningEnabled: boolean;
  cdnEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export interface CreateBucketInput {
  name: string;
  description?: string;
  visibility?: BucketVisibility;
  providerId?: string;
  region?: string;
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  versioningEnabled?: boolean;
  cdnEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateBucketInput {
  name?: string;
  description?: string;
  visibility?: BucketVisibility;
  status?: BucketStatus;
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  versioningEnabled?: boolean;
  cdnEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface BucketStats {
  totalFiles: number;
  totalSizeBytes: number;
  totalVersions: number;
  fileTypeBreakdown: Record<string, number>;
  lastUploadedAt?: string;
}