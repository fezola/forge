import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import type {
  FileDefinition, CreateFileInput, UpdateFileInput, FileListResult,
  FileVersion, FolderInfo, UploadResult, ImageProcessingOptions, FileStatus,
} from '@forge/storage-types';
import { StorageError } from '@forge/storage-types';
import type {
  IFileRepository, IStorageProviderRegistryPort, IStorageEventEmitter,
  IImageProcessor, IBucketRepository,
} from '../domain/storage-interfaces';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @Inject('IFileRepository')
    private readonly fileRepo: IFileRepository,
    @Inject('IBucketRepository')
    private readonly bucketRepo: IBucketRepository,
    @Inject('IStorageProviderRegistryPort')
    private readonly providerRegistry: IStorageProviderRegistryPort,
    @Inject('IStorageEventEmitter')
    private readonly eventEmitter: IStorageEventEmitter,
    @Inject('IImageProcessor')
    private readonly imageProcessor: IImageProcessor,
  ) {}

  async upload(
    projectId: string,
    bucketId: string,
    fileName: string,
    data: Buffer,
    options?: {
      mimeType?: string;
      folder?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
      imageProcessing?: ImageProcessingOptions;
      uploadedBy?: string;
    },
  ): Promise<UploadResult> {
    const mimeType = options?.mimeType || this.guessMimeType(fileName);
    const sizeBytes = data.length;
    const checksum = this.computeChecksum(data);
    const storagePath = this.buildStoragePath(bucketId, options?.folder, fileName);

    const bucket = await this.bucketRepo.findById(bucketId);
    if (!bucket) throw new StorageError('BUCKET_NOT_FOUND', 'Bucket not found', 404);

    const existing = await this.fileRepo.findByChecksum(bucketId, checksum);
    if (existing) {
      return this.toUploadResult(existing);
    }

    const provider = this.providerRegistry.get(bucket.providerId);
    if (!provider) throw new StorageError('STORAGE_PROVIDER_NOT_FOUND', 'Storage provider not found', 404);

    const uploadedBy = options?.uploadedBy || 'system';

    await provider.upload(bucketId, storagePath, data, { mimeType, metadata: options?.metadata });

    let imageMeta: { width?: number; height?: number } = {};
    if (this.imageProcessor?.canHandle(mimeType)) {
      try {
        const info = await this.imageProcessor.getInfo(data);
        imageMeta = { width: info.width, height: info.height };
      } catch { }
    }

    const fileInput: CreateFileInput & { projectId: string; uploadedBy: string; checksumAlgorithm: string; storagePath: string } = {
      bucketId,
      projectId,
      name: fileName,
      mimeType,
      sizeBytes,
      storagePath,
      checksum,
      checksumAlgorithm: 'sha256',
      folder: options?.folder,
      tags: options?.tags,
      metadata: options?.metadata,
      uploadedBy,
      ...imageMeta,
    };

    const file = await this.fileRepo.create(fileInput);
    await this.bucketRepo.updateStats(bucketId, { totalFiles: 1, totalSizeBytes: sizeBytes });

    await this.emitEvent('storage.file.uploaded', projectId, bucketId, uploadedBy, {
      file: { id: file.id, name: fileName, mimeType, sizeBytes, folder: options?.folder, tags: options?.tags, version: 1 },
    });

    return this.toUploadResult(file);
  }

  async update(id: string, input: UpdateFileInput, actorId: string): Promise<FileDefinition> {
    const file = await this.fileRepo.findById(id);
    if (!file) throw new StorageError('FILE_NOT_FOUND', 'File not found', 404);

    const updated = await this.fileRepo.update(id, input);
    await this.emitEvent('storage.file.updated', file.projectId, file.bucketId, actorId, {
      file: { id: file.id, name: file.name, mimeType: file.mimeType, sizeBytes: file.sizeBytes, folder: file.folder, tags: file.tags, version: file.version },
      changes: this.extractChanges(file, input),
    });

    return updated;
  }

  async delete(id: string, actorId: string): Promise<void> {
    const file = await this.fileRepo.findById(id);
    if (!file) throw new StorageError('FILE_NOT_FOUND', 'File not found', 404);

    const bucket = await this.bucketRepo.findById(file.bucketId);
    if (bucket && bucket.versioningEnabled) {
      await this.fileRepo.softDelete(id);
    } else {
      const provider = bucket ? this.providerRegistry.get(bucket.providerId) : undefined;
      if (provider) await provider.delete(file.bucketId, file.storagePath);
      await this.fileRepo.hardDelete(id);
    }

    await this.bucketRepo.updateStats(file.bucketId, { totalFiles: -1, totalSizeBytes: -file.sizeBytes });
    await this.emitEvent('storage.file.deleted', file.projectId, file.bucketId, actorId, {
      file: { id: file.id, name: file.name, mimeType: file.mimeType, sizeBytes: file.sizeBytes, version: file.version },
    });
  }

  async findById(id: string): Promise<FileDefinition> {
    const file = await this.fileRepo.findById(id);
    if (!file) throw new StorageError('FILE_NOT_FOUND', 'File not found', 404);
    return file;
  }

  async list(bucketId: string, filter?: {
    offset?: number;
    limit?: number;
    folder?: string;
    status?: FileStatus;
    mimeType?: string;
    tags?: string[];
    searchQuery?: string;
  }): Promise<FileListResult> {
    return this.fileRepo.findByBucket(bucketId, {
      offset: filter?.offset,
      limit: filter?.limit,
      folder: filter?.folder,
      status: filter?.status,
      mimeType: filter?.mimeType,
      tags: filter?.tags,
      searchQuery: filter?.searchQuery,
    });
  }

  async getVersions(fileId: string): Promise<FileVersion[]> {
    await this.findById(fileId);
    return this.fileRepo.findVersions(fileId);
  }

  async restoreVersion(fileId: string, versionId: string, actorId: string): Promise<FileDefinition> {
    const file = await this.findById(fileId);
    const versions = await this.fileRepo.findVersions(fileId);
    const version = versions.find((v: FileVersion) => v.id === versionId);
    if (!version) throw new StorageError('FILE_VERSION_NOT_FOUND', 'Version not found', 404);

    const bucket = await this.bucketRepo.findById(file.bucketId);
    if (!bucket) throw new StorageError('BUCKET_NOT_FOUND', 'Bucket not found', 404);

    const provider = this.providerRegistry.get(bucket.providerId);
    if (!provider) throw new StorageError('STORAGE_PROVIDER_NOT_FOUND', 'Storage provider not found', 404);

    const versionData = await provider.download(file.bucketId, version.storagePath);
    await provider.upload(file.bucketId, file.storagePath, versionData, { mimeType: file.mimeType });

    const newVersion = await this.fileRepo.createVersion({
      fileId: file.id,
      versionNumber: file.version + 1,
      sizeBytes: version.sizeBytes,
      storagePath: file.storagePath,
      checksum: version.checksum,
      uploadedBy: actorId,
    });

    await this.emitEvent('storage.file.version.restored', file.projectId, file.bucketId, actorId, {
      file: { id: file.id, name: file.name, mimeType: file.mimeType, sizeBytes: file.sizeBytes, version: newVersion.versionNumber },
      version: { id: versionId, number: version.versionNumber },
    });

    return this.fileRepo.findById(fileId) as Promise<FileDefinition>;
  }

  async listFolders(bucketId: string, prefix?: string): Promise<FolderInfo[]> {
    return this.fileRepo.findFolders(bucketId, prefix);
  }

  async move(fileId: string, targetFolder: string, actorId: string): Promise<FileDefinition> {
    const file = await this.findById(fileId);
    const oldStoragePath = file.storagePath;
    const newStoragePath = this.buildStoragePath(file.bucketId, targetFolder, file.name);

    const bucket = await this.bucketRepo.findById(file.bucketId);
    if (!bucket) throw new StorageError('BUCKET_NOT_FOUND', 'Bucket not found', 404);

    const provider = this.providerRegistry.get(bucket.providerId);
    if (provider) await provider.move(file.bucketId, oldStoragePath, file.bucketId, newStoragePath);

    await this.fileRepo.update(fileId, { folder: targetFolder });
    await this.emitEvent('storage.file.moved', file.projectId, file.bucketId, actorId, {
      file: { id: file.id, name: file.name, mimeType: file.mimeType, sizeBytes: file.sizeBytes, version: file.version },
      changes: { folder: { from: file.folder, to: targetFolder }, storagePath: { from: oldStoragePath, to: newStoragePath } },
    });

    return this.fileRepo.findById(fileId) as Promise<FileDefinition>;
  }

  async copy(fileId: string, targetBucketId: string, targetFolder?: string, actorId?: string): Promise<FileDefinition> {
    const file = await this.findById(fileId);

    const sourceBucket = await this.bucketRepo.findById(file.bucketId);
    const destBucket = await this.bucketRepo.findById(targetBucketId);
    if (!sourceBucket || !destBucket) throw new StorageError('BUCKET_NOT_FOUND', 'Bucket not found', 404);

    const sourceProvider = this.providerRegistry.get(sourceBucket.providerId);
    const destProvider = this.providerRegistry.get(destBucket.providerId);
    if (!sourceProvider || !destProvider) throw new StorageError('STORAGE_PROVIDER_NOT_FOUND', 'Storage provider not found', 404);

    const newStoragePath = this.buildStoragePath(targetBucketId, targetFolder, file.name);
    await sourceProvider.copy(file.bucketId, file.storagePath, targetBucketId, newStoragePath);

    const newFile = await this.fileRepo.create({
      bucketId: targetBucketId,
      projectId: file.projectId,
      name: file.name,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      storagePath: newStoragePath,
      checksum: file.checksum,
      checksumAlgorithm: 'sha256',
      folder: targetFolder,
      tags: file.tags,
      uploadedBy: actorId || 'system',
    });

    await this.emitEvent('storage.file.copied', file.projectId, targetBucketId, actorId || 'system', {
      file: { id: newFile.id, name: newFile.name, mimeType: newFile.mimeType, sizeBytes: newFile.sizeBytes, version: newFile.version },
      source: { fileId, bucketId: file.bucketId },
    });

    return newFile;
  }

  private buildStoragePath(bucketId: string, folder: string | undefined, fileName: string): string {
    const id = uuid().slice(0, 8);
    if (folder) return `${bucketId}/${folder}/${id}-${fileName}`;
    return `${bucketId}/${id}-${fileName}`;
  }

  private computeChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private guessMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', mp4: 'video/mp4', mov: 'video/quicktime',
      webm: 'video/webm', mp3: 'audio/mpeg', wav: 'audio/wav', pdf: 'application/pdf',
      doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      zip: 'application/zip', json: 'application/json', csv: 'text/csv',
      md: 'text/markdown', txt: 'text/plain',
    };
    return mimeMap[ext || ''] || 'application/octet-stream';
  }

  private async emitEvent(type: string, projectId: string, bucketId: string, actorId: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await this.eventEmitter.emit(type as any, payload as any, actorId, projectId, bucketId);
    } catch (err) {
      this.logger.warn(`Failed to emit event ${type}: ${(err as Error).message}`);
    }
  }

  private toUploadResult(file: FileDefinition): UploadResult {
    return {
      fileId: file.id,
      bucketId: file.bucketId,
      name: file.name,
      sizeBytes: file.sizeBytes,
      mimeType: file.mimeType,
      checksum: file.checksum,
      publicUrl: file.publicUrl,
      cdnUrl: file.cdnUrl,
      version: file.version,
      createdAt: file.createdAt,
    };
  }

  private extractChanges(existing: FileDefinition, input: UpdateFileInput): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && (existing as any)[key] !== value) {
        changes[key] = { from: (existing as any)[key], to: value };
      }
    }
    return changes;
  }
}