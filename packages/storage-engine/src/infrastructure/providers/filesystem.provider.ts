import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import type {
  IStorageProvider, StorageProviderConfig, StorageProviderFeatures, StorageProviderType,
} from '@forge/storage-types';

@Injectable()
export class FilesystemProvider implements IStorageProvider {
  readonly type: StorageProviderType = 'forge_managed';
  readonly features: StorageProviderFeatures = {
    versioning: false,
    lifecycle: false,
    signedUrls: false,
    multipartUpload: false,
    imageProcessing: false,
    cdn: false,
    search: false,
    tagging: false,
    folders: true,
    bucketManagement: true,
    storageClass: false,
    crossRegionReplication: false,
  };

  private readonly logger = new Logger(FilesystemProvider.name);
  private basePath = '';

  async initialize(config: StorageProviderConfig): Promise<void> {
    this.basePath = (config.options?.basePath as string) || path.join(process.cwd(), 'forge-storage');
    await fs.mkdir(this.basePath, { recursive: true });
    this.logger.log(`Filesystem provider initialized at ${this.basePath}`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await fs.access(this.basePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  async createBucket(bucketId: string): Promise<void> {
    const bucketPath = this.bucketPath(bucketId);
    await fs.mkdir(bucketPath, { recursive: true });
  }

  async deleteBucket(bucketId: string): Promise<void> {
    const bucketPath = this.bucketPath(bucketId);
    await fs.rm(bucketPath, { recursive: true, force: true });
  }

  async bucketExists(bucketId: string): Promise<boolean> {
    const bucketPath = this.bucketPath(bucketId);
    try {
      await fs.access(bucketPath);
      return true;
    } catch {
      return false;
    }
  }

  async listBuckets(): Promise<string[]> {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }

  async upload(
    bucketId: string,
    storagePath: string,
    data: Buffer | NodeJS.ReadableStream,
    options?: { mimeType?: string; metadata?: Record<string, unknown> },
  ): Promise<{ path: string; checksum: string; sizeBytes: number }> {
    const fullPath = this.resolvePath(bucketId, storagePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    const buffer = Buffer.isBuffer(data) ? data : await this.streamToBuffer(data);
    await fs.writeFile(fullPath, buffer);

    if (options?.metadata) {
      await this.writeMetadata(fullPath, options.metadata);
    }

    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    return { path: storagePath, checksum, sizeBytes: buffer.length };
  }

  async download(bucketId: string, storagePath: string): Promise<Buffer> {
    const fullPath = this.resolvePath(bucketId, storagePath);
    return fs.readFile(fullPath);
  }

  async downloadStream(bucketId: string, storagePath: string): Promise<NodeJS.ReadableStream> {
    const { createReadStream } = await import('fs');
    const fullPath = this.resolvePath(bucketId, storagePath);
    return createReadStream(fullPath) as unknown as NodeJS.ReadableStream;
  }

  async delete(bucketId: string, storagePath: string): Promise<void> {
    const fullPath = this.resolvePath(bucketId, storagePath);
    await fs.unlink(fullPath).catch(() => {});
    await this.deleteFileMetadata(fullPath).catch(() => {});
  }

  async copy(sourceBucket: string, sourcePath: string, destBucket: string, destPath: string): Promise<void> {
    const sourceFull = this.resolvePath(sourceBucket, sourcePath);
    const destFull = this.resolvePath(destBucket, destPath);
    await fs.mkdir(path.dirname(destFull), { recursive: true });
    await fs.cp(sourceFull, destFull);
  }

  async move(sourceBucket: string, sourcePath: string, destBucket: string, destPath: string): Promise<void> {
    const sourceFull = this.resolvePath(sourceBucket, sourcePath);
    const destFull = this.resolvePath(destBucket, destPath);
    if (sourceBucket === destBucket && path.dirname(sourcePath) === path.dirname(destPath)) {
      await fs.rename(sourceFull, destFull);
    } else {
      await this.copy(sourceBucket, sourcePath, destBucket, destPath);
      await this.delete(sourceBucket, sourcePath);
    }
  }

  async exists(bucketId: string, storagePath: string): Promise<boolean> {
    const fullPath = this.resolvePath(bucketId, storagePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(bucketId: string, storagePath: string): Promise<Record<string, unknown>> {
    const metaPath = this.metadataPath(this.resolvePath(bucketId, storagePath));
    try {
      const raw = await fs.readFile(metaPath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  async setMetadata(bucketId: string, storagePath: string, metadata: Record<string, unknown>): Promise<void> {
    const fullPath = this.resolvePath(bucketId, storagePath);
    await this.writeMetadata(fullPath, metadata);
  }

  async listFiles(bucketId: string, prefix?: string): Promise<{ path: string; sizeBytes: number; lastModified: string }[]> {
    const bucketPath = this.bucketPath(bucketId);
    const results: { path: string; sizeBytes: number; lastModified: string }[] = [];

    const fullPrefix = prefix ? path.join(bucketPath, prefix) : bucketPath;
    await this.walkDir(fullPrefix, bucketPath, results);
    return results;
  }

  generateSignedUrl(
    _bucketId: string,
    _storagePath: string,
    _action: 'read' | 'write' | 'delete',
    _expiresInSeconds: number,
  ): Promise<string> {
    throw new Error('Signed URLs not supported by filesystem provider');
  }

  async generatePublicUrl(bucketId: string, storagePath: string): Promise<string> {
    const fullPath = this.resolvePath(bucketId, storagePath);
    return `file://${fullPath.replace(/\\/g, '/')}`;
  }

  initiateMultipartUpload(
    _bucketId: string,
    _storagePath: string,
    _options?: { mimeType?: string; metadata?: Record<string, unknown> },
  ): Promise<{ uploadId: string }> {
    throw new Error('Multipart upload not supported by filesystem provider');
  }

  uploadPart(
    _bucketId: string,
    _storagePath: string,
    _uploadId: string,
    _partNumber: number,
    _data: Buffer,
  ): Promise<{ etag: string }> {
    throw new Error('Multipart upload not supported by filesystem provider');
  }

  completeMultipartUpload(
    _bucketId: string,
    _storagePath: string,
    _uploadId: string,
    _parts: { partNumber: number; etag: string }[],
  ): Promise<void> {
    throw new Error('Multipart upload not supported by filesystem provider');
  }

  abortMultipartUpload(
    _bucketId: string,
    _storagePath: string,
    _uploadId: string,
  ): Promise<void> {
    throw new Error('Multipart upload not supported by filesystem provider');
  }

  private bucketPath(bucketId: string): string {
    return path.join(this.basePath, bucketId);
  }

  private resolvePath(bucketId: string, storagePath: string): string {
    const bucketDir = this.bucketPath(bucketId);
    const safePath = path.normalize(storagePath).replace(/^(\.\.(\/|\\))+/, '');
    return path.join(bucketDir, safePath);
  }

  private metadataPath(filePath: string): string {
    return filePath + '.meta.json';
  }

  private async writeMetadata(filePath: string, metadata: Record<string, unknown>): Promise<void> {
    const metaPath = this.metadataPath(filePath);
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  private async deleteFileMetadata(filePath: string): Promise<void> {
    const metaPath = this.metadataPath(filePath);
    await fs.unlink(metaPath).catch(() => {});
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private async walkDir(
    dir: string,
    rootDir: string,
    results: { path: string; sizeBytes: number; lastModified: string }[],
  ): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name.endsWith('.meta.json')) continue;
      if (entry.isDirectory()) {
        await this.walkDir(fullPath, rootDir, results);
      } else {
        const stat = await fs.stat(fullPath);
        const relativePath = path.relative(rootDir, fullPath);
        results.push({ path: relativePath, sizeBytes: stat.size, lastModified: stat.mtime.toISOString() });
      }
    }
  }
}