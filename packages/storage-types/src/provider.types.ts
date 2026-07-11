export type StorageProviderType = 'forge_managed' | 's3_compatible' | 'supabase' | 'cloudflare_r2' | 'google_cloud_storage' | 'azure_blob' | 'local_filesystem' | 'custom';

export interface StorageProviderConfig {
  id: string;
  name: string;
  type: StorageProviderType;
  isDefault: boolean;
  enabled: boolean;
  options: Record<string, unknown>;
  region?: string;
  bucketPrefix?: string;
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
  features: StorageProviderFeatures;
  status: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageProviderFeatures {
  versioning: boolean;
  lifecycle: boolean;
  signedUrls: boolean;
  multipartUpload: boolean;
  imageProcessing: boolean;
  cdn: boolean;
  search: boolean;
  tagging: boolean;
  folders: boolean;
  bucketManagement: boolean;
  storageClass: boolean;
  crossRegionReplication: boolean;
}

export interface IStorageProvider {
  readonly type: StorageProviderType;
  readonly features: StorageProviderFeatures;

  initialize(config: StorageProviderConfig): Promise<void>;
  healthCheck(): Promise<boolean>;

  createBucket(bucketId: string, region?: string): Promise<void>;
  deleteBucket(bucketId: string): Promise<void>;
  bucketExists(bucketId: string): Promise<boolean>;
  listBuckets(): Promise<string[]>;

  upload(
    bucketId: string,
    storagePath: string,
    data: Buffer | NodeJS.ReadableStream,
    options?: { mimeType?: string; metadata?: Record<string, unknown> },
  ): Promise<{ path: string; checksum: string; sizeBytes: number }>;

  download(bucketId: string, storagePath: string): Promise<Buffer>;
  downloadStream(bucketId: string, storagePath: string): Promise<NodeJS.ReadableStream>;

  delete(bucketId: string, storagePath: string): Promise<void>;
  copy(sourceBucket: string, sourcePath: string, destBucket: string, destPath: string): Promise<void>;
  move(sourceBucket: string, sourcePath: string, destBucket: string, destPath: string): Promise<void>;

  exists(bucketId: string, storagePath: string): Promise<boolean>;
  getMetadata(bucketId: string, storagePath: string): Promise<Record<string, unknown>>;
  setMetadata(bucketId: string, storagePath: string, metadata: Record<string, unknown>): Promise<void>;

  listFiles(bucketId: string, prefix?: string): Promise<{ path: string; sizeBytes: number; lastModified: string }[]>;

  generateSignedUrl(
    bucketId: string,
    storagePath: string,
    action: 'read' | 'write' | 'delete',
    expiresInSeconds: number,
  ): Promise<string>;

  generatePublicUrl(bucketId: string, storagePath: string): Promise<string>;

  initiateMultipartUpload(
    bucketId: string,
    storagePath: string,
    options?: { mimeType?: string; metadata?: Record<string, unknown> },
  ): Promise<{ uploadId: string }>;

  uploadPart(
    bucketId: string,
    storagePath: string,
    uploadId: string,
    partNumber: number,
    data: Buffer,
  ): Promise<{ etag: string }>;

  completeMultipartUpload(
    bucketId: string,
    storagePath: string,
    uploadId: string,
    parts: { partNumber: number; etag: string }[],
  ): Promise<void>;

  abortMultipartUpload(bucketId: string, storagePath: string, uploadId: string): Promise<void>;
}

export interface IStorageProviderRegistry {
  register(provider: IStorageProvider): void;
  get(type: StorageProviderType): IStorageProvider | undefined;
  getAll(): IStorageProvider[];
  getForProject(projectId: string): Promise<IStorageProvider[]>;
  getDefault(): IStorageProvider | undefined;
}