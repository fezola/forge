import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { FileDefinition, FileListResult, FileVersion, FolderInfo } from '@forge/storage-types';
import type { IFileRepository } from '@forge/storage-engine';

function toFile(row: any): FileDefinition {
  return {
    id: row.id,
    bucketId: row.bucketId,
    projectId: row.projectId,
    name: row.name,
    originalName: row.originalName ?? row.name,
    extension: row.extension ?? (row.name.includes('.') ? row.name.split('.').pop()! : ''),
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    status: row.status,
    storagePath: row.storagePath,
    publicUrl: row.publicUrl ?? undefined,
    cdnUrl: row.cdnUrl ?? undefined,
    checksum: row.checksum,
    checksumAlgorithm: row.checksumAlgorithm ?? 'sha256',
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    durationMs: row.durationMs ?? undefined,
    tags: row.tags ?? [],
    folder: row.folder ?? undefined,
    version: row.version,
    isLatestVersion: row.isLatestVersion ?? true,
    parentFileId: row.parentFileId ?? undefined,
    metadata: row.metadata ?? undefined,
    uploadedBy: row.uploadedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? undefined,
  };
}

function toVersion(row: any): FileVersion {
  return {
    id: row.id,
    fileId: row.fileId,
    versionNumber: row.versionNumber,
    sizeBytes: row.sizeBytes,
    storagePath: row.storagePath,
    checksum: row.checksum,
    uploadedBy: row.uploadedBy,
    createdAt: row.createdAt.toISOString(),
    metadata: row.metadata ?? undefined,
  };
}

@Injectable()
export class PrismaFileRepository implements IFileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: any): Promise<FileDefinition> {
    const row = await this.prisma.storageFile.create({
      data: {
        id: input.id,
        bucketId: input.bucketId,
        projectId: input.projectId,
        name: input.name,
        originalName: input.originalName ?? input.name,
        extension: input.extension ?? (input.name.includes('.') ? input.name.split('.').pop()! : ''),
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        status: input.status ?? 'ready',
        storagePath: input.storagePath,
        publicUrl: input.publicUrl,
        cdnUrl: input.cdnUrl,
        checksum: input.checksum,
        checksumAlgorithm: input.checksumAlgorithm ?? 'sha256',
        width: input.width,
        height: input.height,
        durationMs: input.durationMs,
        tags: input.tags ?? [],
        folder: input.folder,
        version: input.version ?? 1,
        isLatestVersion: true,
        parentFileId: input.parentFileId,
        metadata: input.metadata ?? undefined,
        uploadedBy: input.uploadedBy,
      },
    });
    return toFile(row);
  }

  async update(id: string, input: any): Promise<FileDefinition> {
    const row = await this.prisma.storageFile.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.folder !== undefined && { folder: input.folder }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });
    return toFile(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.storageFile.update({
      where: { id },
      data: { deletedAt: new Date(), isLatestVersion: false },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.storageFile.delete({ where: { id } });
  }

  async findById(id: string): Promise<FileDefinition | null> {
    const row = await this.prisma.storageFile.findUnique({ where: { id } });
    return row ? toFile(row) : null;
  }

  async findByBucket(bucketId: string, filter: any): Promise<FileListResult> {
    const where: any = { bucketId, deletedAt: null };
    if (filter.folder !== undefined) where.folder = filter.folder;
    if (filter.status !== undefined) where.status = filter.status;
    if (filter.mimeType !== undefined) where.mimeType = filter.mimeType;
    if (filter.tags && filter.tags.length > 0) where.tags = { hasSome: filter.tags };
    if (filter.searchQuery) where.name = { contains: filter.searchQuery, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.storageFile.findMany({
        where,
        skip: filter.offset ?? 0,
        take: filter.limit ?? 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.storageFile.count({ where }),
    ]);
    return { items: items.map(toFile), total, offset: filter.offset ?? 0, limit: filter.limit ?? 50 };
  }

  async findVersions(fileId: string): Promise<FileVersion[]> {
    const rows = await this.prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: { versionNumber: 'desc' },
    });
    return rows.map(toVersion);
  }

  async createVersion(input: any): Promise<FileVersion> {
    const row = await this.prisma.fileVersion.create({ data: input });
    return toVersion(row);
  }

  async findFolders(bucketId: string, prefix?: string): Promise<FolderInfo[]> {
    const files = await this.prisma.storageFile.findMany({
      where: { bucketId, deletedAt: null, ...(prefix ? { folder: { startsWith: prefix } } : { folder: { not: null } }) },
      select: { folder: true, sizeBytes: true, updatedAt: true },
    });

    const folderMap = new Map<string, { fileCount: number; totalSizeBytes: number; updatedAt: Date }>();
    for (const f of files) {
      if (!f.folder) continue;
      const existing = folderMap.get(f.folder) || { fileCount: 0, totalSizeBytes: 0, updatedAt: new Date(0) };
      existing.fileCount++;
      existing.totalSizeBytes += f.sizeBytes;
      if (f.updatedAt > existing.updatedAt) existing.updatedAt = f.updatedAt;
      folderMap.set(f.folder, existing);
    }

    return Array.from(folderMap.entries()).map(([name, info]) => ({
      name: name.split('/').pop() || name,
      path: name,
      fileCount: info.fileCount,
      totalSizeBytes: info.totalSizeBytes,
      updatedAt: info.updatedAt.toISOString(),
    }));
  }

  async findByChecksum(bucketId: string, checksum: string): Promise<FileDefinition | null> {
    const row = await this.prisma.storageFile.findFirst({ where: { bucketId, checksum, deletedAt: null } });
    return row ? toFile(row) : null;
  }

  async countByProject(projectId: string): Promise<number> {
    return this.prisma.storageFile.count({ where: { projectId, deletedAt: null } });
  }

  async countByBucket(bucketId: string): Promise<number> {
    return this.prisma.storageFile.count({ where: { bucketId, deletedAt: null } });
  }

  async totalSizeByBucket(bucketId: string): Promise<number> {
    const result = await this.prisma.storageFile.aggregate({
      where: { bucketId, deletedAt: null },
      _sum: { sizeBytes: true },
    });
    return result._sum.sizeBytes ?? 0;
  }
}