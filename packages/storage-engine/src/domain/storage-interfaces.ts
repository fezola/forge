import type {
  CreateBucketInput, UpdateBucketInput, BucketDefinition, BucketStats,
  CreateFileInput, UpdateFileInput, FileDefinition, FileListResult, FileVersion, FolderInfo,
  IStorageProvider,
  UploadRequest, UploadResult, ImageProcessingOptions, MultipartUploadInit,
  TransformOptions, ImageTransformResult,
  GrantPermissionInput, AccessCheckInput, AccessCheckResult, StoragePermission,
  LifecycleRule, LifecycleExecution,
  SignedUrlRequest, SignedUrlResult,
  CdnConfig, CdnPurgeRequest, CdnMetrics,
  StorageEvent, StorageEventType, StorageEventPayload,
  FileStatus,
} from '@forge/storage-types';

// ---- Bucket Repository ----
export interface IBucketRepository {
  create(input: CreateBucketInput & { id: string; projectId: string; slug: string; createdBy: string }): Promise<BucketDefinition>;
  update(id: string, input: UpdateBucketInput): Promise<BucketDefinition>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BucketDefinition | null>;
  findByProject(projectId: string): Promise<BucketDefinition[]>;
  findBySlug(projectId: string, slug: string): Promise<BucketDefinition | null>;
  countByProject(projectId: string): Promise<number>;
  getStats(id: string): Promise<BucketStats>;
  updateStats(id: string, delta: Partial<BucketStats>): Promise<void>;
}

// ---- File ----
export interface IFileRepository {
  create(input: CreateFileInput & { projectId: string; uploadedBy: string; checksumAlgorithm: string; storagePath: string }): Promise<FileDefinition>;
  update(id: string, input: UpdateFileInput): Promise<FileDefinition>;
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  findById(id: string): Promise<FileDefinition | null>;
  findByBucket(bucketId: string, filter: { offset?: number; limit?: number; folder?: string; status?: FileStatus; mimeType?: string; tags?: string[]; searchQuery?: string }): Promise<FileListResult>;
  findVersions(fileId: string): Promise<FileVersion[]>;
  createVersion(input: { fileId: string; versionNumber: number; sizeBytes: number; storagePath: string; checksum: string; uploadedBy: string; metadata?: Record<string, unknown> }): Promise<FileVersion>;
  findFolders(bucketId: string, prefix?: string): Promise<FolderInfo[]>;
  findByChecksum(bucketId: string, checksum: string): Promise<FileDefinition | null>;
  countByProject(projectId: string): Promise<number>;
  countByBucket(bucketId: string): Promise<number>;
  totalSizeByBucket(bucketId: string): Promise<number>;
}

// ---- Provider ----
export interface IStorageProviderRegistryPort {
  register(provider: IStorageProvider): void;
  get(type: string): IStorageProvider | undefined;
  getAll(): IStorageProvider[];
  getForProject(projectId: string): Promise<IStorageProvider[]>;
  getDefault(): IStorageProvider | undefined;
}

// ---- Upload Pipeline ----
export interface IUploadPipeline {
  initiateUpload(request: UploadRequest): Promise<{ uploadUrl?: string; multipart?: MultipartUploadInit }>;
  processUpload(request: UploadRequest, data: Buffer): Promise<UploadResult>;
  completeMultipart(bucketId: string, storagePath: string, uploadId: string, parts: { partNumber: number; etag: string }[]): Promise<UploadResult>;
  abortUpload(bucketId: string, storagePath: string, uploadId: string): Promise<void>;
}

// ---- Image Processing ----
export interface IImageProcessor {
  canHandle(mimeType: string): boolean;
  getInfo(buffer: Buffer): Promise<{ width: number; height: number; format: string; hasAlpha: boolean; orientation?: number }>;
  process(buffer: Buffer, options: ImageProcessingOptions): Promise<{ buffer: Buffer; format: string; width: number; height: number }>;
  transform(fileId: string, options: TransformOptions): Promise<ImageTransformResult>;
  generateThumbnails(buffer: Buffer, mimeType: string, specs: { suffix: string; width: number; height: number }[]): Promise<{ spec: string; buffer: Buffer; width: number; height: number }[]>;
}

// ---- Permission ----
export interface IPermissionService {
  checkAccess(input: AccessCheckInput): Promise<AccessCheckResult>;
  grantPermission(input: GrantPermissionInput, grantedBy: string): Promise<StoragePermission>;
  revokePermission(id: string): Promise<void>;
  listPermissions(bucketId: string): Promise<StoragePermission[]>;
  getEffectivePermissions(identityId: string, bucketId: string): Promise<StoragePermission[]>;
}

// ---- Signed URL ----
export interface ISignedUrlService {
  generate(request: SignedUrlRequest, provider: IStorageProvider, bucketId: string, storagePath: string): Promise<SignedUrlResult>;
  validate(url: string, expectedAction: string): Promise<{ valid: boolean; fileId?: string; reason?: string }>;
}

// ---- CDN ----
export interface ICdnService {
  enableForBucket(bucketId: string, config?: Partial<CdnConfig>): Promise<CdnConfig>;
  disableForBucket(bucketId: string): Promise<void>;
  getConfig(bucketId: string): Promise<CdnConfig | null>;
  getUrl(file: FileDefinition): Promise<string>;
  purge(request: CdnPurgeRequest): Promise<void>;
  getMetrics(bucketId: string): Promise<CdnMetrics>;
}

// ---- Lifecycle ----
export interface ILifecycleService {
  createRule(rule: Omit<LifecycleRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<LifecycleRule>;
  updateRule(id: string, updates: Partial<LifecycleRule>): Promise<LifecycleRule>;
  deleteRule(id: string): Promise<void>;
  listRules(bucketId: string): Promise<LifecycleRule[]>;
  executeRule(ruleId: string): Promise<LifecycleExecution>;
  executeAllForBucket(bucketId: string): Promise<LifecycleExecution[]>;
}

// ---- Events ----
export interface IStorageEventEmitter {
  emit(type: StorageEventType, payload: StorageEventPayload, actorId: string, projectId: string, bucketId: string, fileId?: string): Promise<void>;
  subscribe(type: StorageEventType | '*', handler: (event: StorageEvent) => void): void;
  unsubscribe(type: StorageEventType | '*', handler: (event: StorageEvent) => void): void;
}

// ---- Workflow Bridge ----
export interface IStorageWorkflowBridge {
  emitWorkflowEvent(event: StorageEvent): Promise<void>;
  isAvailable(): boolean;
}

// ---- Search ----
export interface IStorageSearchService {
  searchFiles(projectId: string, query: string, filters?: { bucketId?: string; mimeCategory?: string; tags?: string[]; uploadedBy?: string; createdAfter?: string; createdBefore?: string; folder?: string }): Promise<FileListResult>;
  searchFolders(projectId: string, query: string): Promise<FolderInfo[]>;
  suggestTags(projectId: string, prefix: string): Promise<string[]>;
}

// ---- Quota ----
export interface IQuotaChecker {
  checkProjectQuota(projectId: string, additionalBytes: number): Promise<{ allowed: boolean; currentBytes: number; maxBytes: number; reason?: string }>;
  checkBucketQuota(bucketId: string, additionalBytes: number): Promise<{ allowed: boolean; currentBytes: number; maxBytes: number; reason?: string }>;
}