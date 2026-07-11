import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { BucketDefinition, CreateBucketInput, UpdateBucketInput, BucketStats, BucketVisibility, BucketStatus } from '@forge/storage-types';
import type { IBucketRepository } from '../domain/storage-interfaces';

function toBucket(row: any): BucketDefinition {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    visibility: row.visibility as BucketVisibility,
    status: row.status as BucketStatus,
    providerId: row.providerId,
    region: row.region ?? undefined,
    maxFileSizeBytes: row.maxFileSizeBytes,
    allowedMimeTypes: row.allowedMimeTypes ?? undefined,
    allowedExtensions: row.allowedExtensions ?? undefined,
    versioningEnabled: row.versioningEnabled,
    cdnEnabled: row.cdnEnabled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    metadata: row.metadata ?? undefined,
  };
}

@Injectable()
export class PrismaBucketRepository implements IBucketRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateBucketInput & { id: string; projectId: string; slug: string; createdBy: string }): Promise<BucketDefinition> {
    const row = await this.prisma.storageBucket.create({
      data: {
        id: input.id,
        projectId: input.projectId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        visibility: input.visibility || 'private',
        providerId: input.providerId || 'forge_managed',
        region: input.region,
        maxFileSizeBytes: input.maxFileSizeBytes ?? 104857600,
        allowedMimeTypes: input.allowedMimeTypes ?? [],
        allowedExtensions: input.allowedExtensions ?? [],
        versioningEnabled: input.versioningEnabled ?? true,
        cdnEnabled: input.cdnEnabled ?? false,
        createdBy: input.createdBy,
        metadata: input.metadata as any,
      },
    });
    return toBucket(row);
  }

  async update(id: string, input: UpdateBucketInput): Promise<BucketDefinition> {
    const row = await this.prisma.storageBucket.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.visibility !== undefined && { visibility: input.visibility }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.maxFileSizeBytes !== undefined && { maxFileSizeBytes: input.maxFileSizeBytes }),
        ...(input.allowedMimeTypes !== undefined && { allowedMimeTypes: input.allowedMimeTypes }),
        ...(input.allowedExtensions !== undefined && { allowedExtensions: input.allowedExtensions }),
        ...(input.versioningEnabled !== undefined && { versioningEnabled: input.versioningEnabled }),
        ...(input.cdnEnabled !== undefined && { cdnEnabled: input.cdnEnabled }),
        ...(input.metadata !== undefined && { metadata: input.metadata as any }),
      },
    });
    return toBucket(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storageBucket.delete({ where: { id } });
  }

  async findById(id: string): Promise<BucketDefinition | null> {
    const row = await this.prisma.storageBucket.findUnique({ where: { id } });
    return row ? toBucket(row) : null;
  }

  async findByProject(projectId: string): Promise<BucketDefinition[]> {
    const rows = await this.prisma.storageBucket.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
    return rows.map(toBucket);
  }

  async findBySlug(projectId: string, slug: string): Promise<BucketDefinition | null> {
    const row = await this.prisma.storageBucket.findUnique({ where: { projectId_slug: { projectId, slug } } });
    return row ? toBucket(row) : null;
  }

  async countByProject(projectId: string): Promise<number> {
    return this.prisma.storageBucket.count({ where: { projectId } });
  }

  async getStats(id: string): Promise<BucketStats> {
    const [totalFiles, totalSizeResult, fileTypes] = await Promise.all([
      this.prisma.storageFile.count({ where: { bucketId: id, deletedAt: null } }),
      this.prisma.storageFile.aggregate({ where: { bucketId: id, deletedAt: null }, _sum: { sizeBytes: true } }),
      this.prisma.storageFile.groupBy({ by: ['mimeType'], where: { bucketId: id, deletedAt: null }, _count: true }),
    ]);

    const fileTypeBreakdown: Record<string, number> = {};
    for (const ft of fileTypes) {
      const category = ft.mimeType.split('/')[0] || 'other';
      fileTypeBreakdown[category] = (fileTypeBreakdown[category] || 0) + ft._count;
    }

    return {
      totalFiles,
      totalSizeBytes: totalSizeResult._sum.sizeBytes ?? 0,
      totalVersions: 0,
      fileTypeBreakdown,
      lastUploadedAt: undefined,
    };
  }

  async updateStats(_id: string, _delta: Partial<BucketStats>): Promise<void> {
    // stats are computed on-the-fly via getStats
  }
}