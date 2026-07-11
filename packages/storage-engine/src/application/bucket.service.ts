import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type {
  CreateBucketInput, UpdateBucketInput, BucketDefinition, BucketStats,
} from '@forge/storage-types';
import { StorageError } from '@forge/storage-types';
import type { IBucketRepository, IStorageProviderRegistryPort, IStorageEventEmitter, IQuotaChecker } from '../domain/storage-interfaces';

const MAX_BUCKETS_PER_PROJECT = 100;
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

@Injectable()
export class BucketService {
  private readonly logger = new Logger(BucketService.name);

  constructor(
    @Inject('IBucketRepository')
    private readonly bucketRepo: IBucketRepository,
    @Inject('IStorageProviderRegistryPort')
    private readonly providerRegistry: IStorageProviderRegistryPort,
    @Inject('IStorageEventEmitter')
    private readonly eventEmitter: IStorageEventEmitter,
    @Inject('IQuotaChecker')
    private readonly quotaChecker: IQuotaChecker,
  ) {}

  async create(projectId: string, input: CreateBucketInput, createdBy: string): Promise<BucketDefinition> {
    const count = await this.bucketRepo.countByProject(projectId);
    if (count >= MAX_BUCKETS_PER_PROJECT) {
      throw new StorageError('QUOTA_EXCEEDED', `Maximum ${MAX_BUCKETS_PER_PROJECT} buckets per project`, 400);
    }

    const slug = this.toSlug(input.name);
    const existing = await this.bucketRepo.findBySlug(projectId, slug);
    if (existing) {
      throw new StorageError('BUCKET_ALREADY_EXISTS', `Bucket "${input.name}" already exists in this project`, 409);
    }

    const providerId = input.providerId || this.providerRegistry.getDefault()?.type || 'forge_managed';
    const provider = this.providerRegistry.get(providerId);
    if (!provider) {
      throw new StorageError('STORAGE_PROVIDER_NOT_FOUND', `Storage provider "${providerId}" not found`, 404);
    }

    const id = uuid();
    await provider.createBucket(id, input.region);

    const bucket = await this.bucketRepo.create({
      id,
      projectId,
      name: input.name,
      slug,
      description: input.description,
      visibility: input.visibility || 'private',
      maxFileSizeBytes: input.maxFileSizeBytes || DEFAULT_MAX_FILE_SIZE,
      allowedMimeTypes: input.allowedMimeTypes,
      allowedExtensions: input.allowedExtensions,
      versioningEnabled: input.versioningEnabled ?? true,
      cdnEnabled: input.cdnEnabled ?? false,
      providerId,
      region: input.region,
      createdBy,
      metadata: input.metadata,
    });

    await this.emitEvent('storage.bucket.created', projectId, bucket.id, createdBy, { bucket });
    return bucket;
  }

  async update(id: string, input: UpdateBucketInput, actorId: string): Promise<BucketDefinition> {
    const existing = await this.bucketRepo.findById(id);
    if (!existing) throw new StorageError('BUCKET_NOT_FOUND', 'Bucket not found', 404);

    const updated = await this.bucketRepo.update(id, input);
    await this.emitEvent('storage.bucket.updated', existing.projectId, id, actorId, { bucket: updated, changes: this.extractChanges(existing, input) });
    return updated;
  }

  async delete(id: string, actorId: string): Promise<void> {
    const existing = await this.bucketRepo.findById(id);
    if (!existing) throw new StorageError('BUCKET_NOT_FOUND', 'Bucket not found', 404);

    const provider = this.providerRegistry.get(existing.providerId);
    if (provider) await provider.deleteBucket(id);

    await this.bucketRepo.delete(id);
    await this.emitEvent('storage.bucket.deleted', existing.projectId, id, actorId, { bucket: existing });
  }

  async findById(id: string): Promise<BucketDefinition> {
    const bucket = await this.bucketRepo.findById(id);
    if (!bucket) throw new StorageError('BUCKET_NOT_FOUND', 'Bucket not found', 404);
    return bucket;
  }

  async findByProject(projectId: string): Promise<BucketDefinition[]> {
    return this.bucketRepo.findByProject(projectId);
  }

  async getStats(id: string): Promise<BucketStats> {
    await this.findById(id);
    return this.bucketRepo.getStats(id);
  }

  async checkFileUploadAllowed(bucketId: string, sizeBytes: number, mimeType: string): Promise<void> {
    const bucket = await this.findById(bucketId);
    if (bucket.status !== 'active') throw new StorageError('BUCKET_INACTIVE', 'Bucket is not active', 400);
    if (sizeBytes > bucket.maxFileSizeBytes) throw new StorageError('FILE_TOO_LARGE', `File exceeds ${bucket.maxFileSizeBytes} byte limit`, 400);
    if (bucket.allowedMimeTypes && bucket.allowedMimeTypes.length > 0 && !bucket.allowedMimeTypes.includes(mimeType)) throw new StorageError('FILE_TYPE_NOT_ALLOWED', `MIME type "${mimeType}" not allowed`, 400);

    const quotaCheck = await this.quotaChecker.checkBucketQuota(bucketId, sizeBytes);
    if (!quotaCheck.allowed) throw new StorageError('QUOTA_EXCEEDED', quotaCheck.reason || 'Storage quota exceeded', 400);
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async emitEvent(type: string, projectId: string, bucketId: string, actorId: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await this.eventEmitter.emit(type as any, {
        bucket: { id: bucketId, name: '', projectId },
        actor: { id: actorId, type: 'user' },
        ...payload,
      } as any, actorId, projectId, bucketId);
    } catch (err) {
      this.logger.warn(`Failed to emit event ${type}: ${(err as Error).message}`);
    }
  }

  private extractChanges(existing: BucketDefinition, input: UpdateBucketInput): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && (existing as any)[key] !== value) {
        changes[key] = { from: (existing as any)[key], to: value };
      }
    }
    return changes;
  }
}