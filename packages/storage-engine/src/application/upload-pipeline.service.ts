import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type {
  UploadRequest, UploadResult,
  MultipartUploadInit,
} from '@forge/storage-types';
import type {
  IStorageProviderRegistryPort, IImageProcessor,
  IFileRepository,
} from '../domain/storage-interfaces';

@Injectable()
export class UploadPipelineService {
  private readonly logger = new Logger(UploadPipelineService.name);
  private activeUploads = new Map<string, { request: UploadRequest; expiresAt: Date }>();

  constructor(
    @Inject('IStorageProviderRegistryPort')
    private readonly providerRegistry: IStorageProviderRegistryPort,
    @Inject('IImageProcessor')
    private readonly imageProcessor: IImageProcessor,
    @Inject('IFileRepository')
    private readonly fileRepo: IFileRepository,
  ) {}

  async initiateUpload(request: UploadRequest): Promise<{ uploadUrl?: string; multipart?: MultipartUploadInit }> {
    this.activeUploads.set(request.id, { request, expiresAt: new Date(Date.now() + 3600000) });
    setTimeout(() => this.cleanupExpired(), 60000);

    if (request.sizeBytes > 100 * 1024 * 1024) {
      return { multipart: this.initiateMultipart(request) };
    }

    if (request.uploadMethod === 'signed_url') {
      const provider = this.getProvider(request.bucketId);
      const signedUrl = await provider.generateSignedUrl(
        request.bucketId,
        `${request.bucketId}/${request.id}-${request.fileName}`,
        'write',
        3600,
      );
      return { uploadUrl: signedUrl };
    }

    return {};
  }

  async processUpload(requestId: string, data: Buffer): Promise<UploadResult | null> {
    const entry = this.activeUploads.get(requestId);
    if (!entry) return null;

    const request = entry.request;
    this.activeUploads.delete(requestId);

    let processedData = data;
    let imageMeta: { width?: number; height?: number } = {};
    const thumbnails: { spec: string; url: string; width: number; height: number; sizeBytes: number }[] = [];

    if (this.imageProcessor?.canHandle(request.mimeType) && request.imageProcessing) {
      try {
        const info = await this.imageProcessor.getInfo(data);
        imageMeta = { width: info.width, height: info.height };

        const result = await this.imageProcessor.process(data, request.imageProcessing);
        processedData = result.buffer;

        if (request.imageProcessing.generateThumbnails) {
          const specs = Array.isArray(request.imageProcessing.generateThumbnails)
            ? request.imageProcessing.generateThumbnails
            : [
                { suffix: 'small', width: 150, height: 150 },
                { suffix: 'medium', width: 300, height: 300 },
                { suffix: 'large', width: 600, height: 600 },
              ];

          const generated = await this.imageProcessor.generateThumbnails(data, request.mimeType, specs);
          for (const thumb of generated) {
            thumbnails.push({
              spec: thumb.spec,
              url: '',
              width: thumb.width,
              height: thumb.height,
              sizeBytes: thumb.buffer.length,
            });
          }
        }
      } catch (err) {
        this.logger.warn(`Image processing failed for ${request.fileName}: ${(err as Error).message}`);
      }
    }

    const storagePath = `${request.bucketId}/${request.id}-${request.fileName}`;
    const checksumAlgorithm = 'sha256';
    const checksum = this.computeChecksum(processedData);

    const provider = this.getProvider(request.bucketId);
    await provider.upload(request.bucketId, storagePath, processedData, {
      mimeType: request.mimeType,
      metadata: { ...request.metadata, imageMeta: imageMeta as Record<string, unknown> },
    });

    const file = await this.fileRepo.create({
      bucketId: request.bucketId,
      projectId: '',
      name: request.fileName,
      mimeType: request.mimeType,
      sizeBytes: processedData.length,
      storagePath,
      checksum,
      checksumAlgorithm,
      folder: request.folder,
      tags: request.tags,
      metadata: request.metadata,
      uploadedBy: 'system',
      ...imageMeta,
    });

    return {
      fileId: file.id,
      bucketId: request.bucketId,
      name: request.fileName,
      sizeBytes: processedData.length,
      mimeType: request.mimeType,
      checksum,
      thumbnails: thumbnails.length > 0 ? thumbnails : undefined,
      version: 1,
      createdAt: file.createdAt,
    };
  }

  private getProvider(_bucketId: string) {
    const providers = this.providerRegistry.getAll();
    const provider = providers[0];
    if (!provider) throw new Error('No storage provider available');
    return provider;
  }

  private initiateMultipart(request: UploadRequest): MultipartUploadInit {
    const partSize = 5 * 1024 * 1024;
    const totalParts = Math.ceil(request.sizeBytes / partSize);
    return {
      uploadId: uuid(),
      partsUrl: [],
      partSizeBytes: partSize,
      totalParts,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  private computeChecksum(data: Buffer): string {
    const { createHash } = require('crypto');
    return createHash('sha256').update(data).digest('hex');
  }

  private cleanupExpired(): void {
    const now = new Date();
    for (const [id, entry] of this.activeUploads) {
      if (entry.expiresAt < now) this.activeUploads.delete(id);
    }
  }
}