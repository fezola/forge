import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaClient) {}

  async listCollections(projectId: string) {
    return this.prisma.cmsCollection.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCollection(id: string) {
    return this.prisma.cmsCollection.findUnique({ where: { id } });
  }

  async createCollection(data: {
    name: string;
    projectId: string;
    sourceTableId?: string;
    forgeApiKey?: string;
    forgeBaseUrl?: string;
    fieldMapping?: any;
  }) {
    return this.prisma.cmsCollection.create({
      data: {
        name: data.name,
        projectId: data.projectId,
        sourceTableId: data.sourceTableId,
        forgeApiKey: data.forgeApiKey,
        forgeBaseUrl: data.forgeBaseUrl,
        fieldMapping: data.fieldMapping ?? null,
      },
    });
  }

  async updateCollection(id: string, data: {
    name?: string;
    sourceTableId?: string;
    forgeApiKey?: string;
    forgeBaseUrl?: string;
    fieldMapping?: any;
    itemCount?: number;
    lastSyncAt?: Date;
    lastSyncStatus?: string;
    lastSyncCount?: number;
  }) {
    return this.prisma.cmsCollection.update({
      where: { id },
      data,
    });
  }

  async deleteCollection(id: string) {
    await this.prisma.cmsCollection.delete({ where: { id } });
  }

  async triggerSync(collectionId: string, projectId: string) {
    const collection = await this.prisma.cmsCollection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.projectId !== projectId) {
      throw new Error('Collection not found');
    }

    const syncEntry = await this.prisma.cmsSyncHistory.create({
      data: {
        collectionId,
        status: 'in_progress',
        startedAt: new Date(),
      },
    });

    await this.prisma.cmsCollection.update({
      where: { id: collectionId },
      data: { lastSyncStatus: 'in_progress', lastSyncAt: new Date() },
    });

    return { syncId: syncEntry.id };
  }

  async completeSync(syncId: string, result: {
    status: 'success' | 'error';
    itemsAdded?: number;
    itemsUpdated?: number;
    itemsRemoved?: number;
    errors?: number;
    errorMessage?: string;
    metadata?: any;
  }) {
    const sync = await this.prisma.cmsSyncHistory.update({
      where: { id: syncId },
      data: {
        status: result.status,
        completedAt: new Date(),
        itemsAdded: result.itemsAdded ?? 0,
        itemsUpdated: result.itemsUpdated ?? 0,
        itemsRemoved: result.itemsRemoved ?? 0,
        errors: result.errors ?? 0,
        errorMessage: result.errorMessage,
        metadata: result.metadata ?? undefined,
      },
    });

    await this.prisma.cmsCollection.update({
      where: { id: sync.collectionId },
      data: {
        lastSyncStatus: result.status,
        lastSyncAt: new Date(),
        lastSyncCount: result.itemsAdded ?? 0,
        itemCount: { increment: (result.itemsAdded ?? 0) - (result.itemsRemoved ?? 0) },
      },
    });

    return sync;
  }

  async getSyncHistory(collectionId: string, status?: string) {
    const where: any = { collectionId };
    if (status) where.status = status;
    return this.prisma.cmsSyncHistory.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async getPendingSyncs() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    return this.prisma.cmsSyncHistory.findMany({
      where: {
        status: 'in_progress',
        completedAt: null,
        startedAt: { gte: cutoff },
      },
      include: { collection: true },
      orderBy: { startedAt: 'asc' },
      take: 10,
    });
  }

  async getAbandonedSyncs() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    return this.prisma.cmsSyncHistory.findMany({
      where: {
        status: 'in_progress',
        completedAt: null,
        startedAt: { lt: cutoff },
      },
      take: 50,
    });
  }

  async markAbandoned(syncId: string) {
    return this.prisma.cmsSyncHistory.update({
      where: { id: syncId },
      data: {
        status: 'error',
        completedAt: new Date(),
        errorMessage: 'Sync abandoned — no completion received within 30 minutes',
      },
    });
  }

  async cleanupOldRecords() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.cmsSyncHistory.deleteMany({
      where: { completedAt: { not: null, lt: cutoff } },
    });
    const collections = await this.prisma.cmsCollection.findMany({
      select: { id: true, _count: { select: { syncHistory: true } } },
    });
    for (const col of collections) {
      const excess = col._count.syncHistory - 100;
      if (excess > 0) {
        const old = await this.prisma.cmsSyncHistory.findMany({
          where: { collectionId: col.id, completedAt: { not: null } },
          orderBy: { startedAt: 'asc' },
          take: excess,
          select: { id: true },
        });
        if (old.length > 0) {
          await this.prisma.cmsSyncHistory.deleteMany({
            where: { id: { in: old.map(o => o.id) } },
          });
        }
      }
    }
    return result;
  }

  async getStats(projectId: string) {
    const collections = await this.prisma.cmsCollection.findMany({ where: { projectId } });
    const totalCollections = collections.length;
    const totalItems = collections.reduce((sum, c) => sum + c.itemCount, 0);

    const recentSync = collections
      .filter(c => c.lastSyncAt)
      .sort((a, b) => (b.lastSyncAt?.getTime() ?? 0) - (a.lastSyncAt?.getTime() ?? 0))[0];

    const activeErrors = collections.filter(c => c.lastSyncStatus === 'error').length;

    return {
      totalCollections,
      totalItems,
      lastSyncAt: recentSync?.lastSyncAt?.toISOString(),
      activeErrors,
    };
  }
}