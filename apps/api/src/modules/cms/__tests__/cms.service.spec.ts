import { CmsService } from '../presentation/cms.service';
import { createMockPrisma, MockPrisma, mockCollection, mockSyncHistory, mockCollectionList, mockSyncHistoryList } from './mocks';

describe('CmsService', () => {
  let service: CmsService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new CmsService(prisma as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listCollections', () => {
    it('returns collections filtered by projectId, ordered by updatedAt desc', async () => {
      const collections = mockCollectionList();
      prisma.cmsCollection.findMany.mockResolvedValue(collections);

      const result = await service.listCollections('default');

      expect(prisma.cmsCollection.findMany).toHaveBeenCalledWith({
        where: { projectId: 'default' },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(collections);
    });

    it('returns empty array when no collections exist', async () => {
      prisma.cmsCollection.findMany.mockResolvedValue([]);

      const result = await service.listCollections('empty');

      expect(result).toEqual([]);
    });
  });

  describe('getCollection', () => {
    it('returns a collection by id', async () => {
      const collection = mockCollection();
      prisma.cmsCollection.findUnique.mockResolvedValue(collection);

      const result = await service.getCollection('col_01');

      expect(prisma.cmsCollection.findUnique).toHaveBeenCalledWith({ where: { id: 'col_01' } });
      expect(result).toEqual(collection);
    });

    it('returns null when collection not found', async () => {
      prisma.cmsCollection.findUnique.mockResolvedValue(null);

      const result = await service.getCollection('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createCollection', () => {
    it('creates a collection with minimal data', async () => {
      const collection = mockCollection({ forgeApiKey: null, forgeBaseUrl: null });
      prisma.cmsCollection.create.mockResolvedValue(collection);

      const result = await service.createCollection({
        name: 'Test Collection',
        projectId: 'default',
      });

      expect(prisma.cmsCollection.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Collection',
          projectId: 'default',
          sourceTableId: undefined,
          forgeApiKey: undefined,
          forgeBaseUrl: undefined,
          fieldMapping: null,
        },
      });
      expect(result).toEqual(collection);
    });

    it('creates a collection with full data including forge credentials', async () => {
      const collection = mockCollection({ forgeApiKey: 'sk-123', forgeBaseUrl: 'https://forge.dev' });
      prisma.cmsCollection.create.mockResolvedValue(collection);

      const result = await service.createCollection({
        name: 'Full Collection',
        projectId: 'default',
        sourceTableId: 'my_table',
        forgeApiKey: 'sk-123',
        forgeBaseUrl: 'https://forge.dev',
        fieldMapping: [{ forgeFieldId: 'id', cmsFieldName: 'ID' }],
      });

      expect(prisma.cmsCollection.create).toHaveBeenCalledWith({
        data: {
          name: 'Full Collection',
          projectId: 'default',
          sourceTableId: 'my_table',
          forgeApiKey: 'sk-123',
          forgeBaseUrl: 'https://forge.dev',
          fieldMapping: [{ forgeFieldId: 'id', cmsFieldName: 'ID' }],
        },
      });
      expect(result).toEqual(collection);
    });
  });

  describe('updateCollection', () => {
    it('updates a collection with partial data', async () => {
      const updated = mockCollection({ name: 'Updated Name' });
      prisma.cmsCollection.update.mockResolvedValue(updated);

      const result = await service.updateCollection('col_01', { name: 'Updated Name' });

      expect(prisma.cmsCollection.update).toHaveBeenCalledWith({
        where: { id: 'col_01' },
        data: { name: 'Updated Name' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteCollection', () => {
    it('deletes a collection by id', async () => {
      prisma.cmsCollection.delete.mockResolvedValue(mockCollection());

      await service.deleteCollection('col_01');

      expect(prisma.cmsCollection.delete).toHaveBeenCalledWith({ where: { id: 'col_01' } });
    });

    it('throws when deleting nonexistent collection', async () => {
      prisma.cmsCollection.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.deleteCollection('nonexistent')).rejects.toThrow('Record not found');
    });
  });

  describe('triggerSync', () => {
    it('creates a sync record and updates collection status', async () => {
      const collection = mockCollection();
      const sync = mockSyncHistory();
      prisma.cmsCollection.findUnique.mockResolvedValue(collection);
      prisma.cmsSyncHistory.create.mockResolvedValue(sync);
      prisma.cmsCollection.update.mockResolvedValue(collection);

      const result = await service.triggerSync('col_01', 'default');

      expect(prisma.cmsCollection.findUnique).toHaveBeenCalledWith({ where: { id: 'col_01' } });
      expect(prisma.cmsSyncHistory.create).toHaveBeenCalledWith({
        data: {
          collectionId: 'col_01',
          status: 'in_progress',
          startedAt: expect.any(Date),
        },
      });
      expect(prisma.cmsCollection.update).toHaveBeenCalledWith({
        where: { id: 'col_01' },
        data: { lastSyncStatus: 'in_progress', lastSyncAt: expect.any(Date) },
      });
      expect(result).toEqual({ syncId: sync.id });
    });

    it('throws when collection does not exist', async () => {
      prisma.cmsCollection.findUnique.mockResolvedValue(null);

      await expect(service.triggerSync('nonexistent', 'default')).rejects.toThrow('Collection not found');
    });

    it('throws when projectId does not match', async () => {
      prisma.cmsCollection.findUnique.mockResolvedValue(mockCollection({ projectId: 'other' }));

      await expect(service.triggerSync('col_01', 'default')).rejects.toThrow('Collection not found');
    });
  });

  describe('completeSync', () => {
    it('marks a sync as successful and updates collection metrics', async () => {
      const sync = mockSyncHistory({ collectionId: 'col_01' });
      const updatedSync = { ...sync, status: 'success', completedAt: new Date(), itemsAdded: 5, itemsUpdated: 2, itemsRemoved: 1 };
      prisma.cmsSyncHistory.update.mockResolvedValue(updatedSync);
      prisma.cmsCollection.update.mockResolvedValue(mockCollection());

      const result = await service.completeSync('sync_01', {
        status: 'success',
        itemsAdded: 5,
        itemsUpdated: 2,
        itemsRemoved: 1,
      });

      expect(prisma.cmsSyncHistory.update).toHaveBeenCalledWith({
        where: { id: 'sync_01' },
        data: expect.objectContaining({
          status: 'success',
          itemsAdded: 5,
          itemsUpdated: 2,
          itemsRemoved: 1,
          errors: 0,
        }),
      });
      expect(prisma.cmsCollection.update).toHaveBeenCalledWith({
        where: { id: 'col_01' },
        data: expect.objectContaining({
          lastSyncStatus: 'success',
          itemCount: { increment: 4 },
        }),
      });
      expect(result).toEqual(updatedSync);
    });

    it('handles error status without incrementing item count', async () => {
      const sync = mockSyncHistory({ collectionId: 'col_01' });
      prisma.cmsSyncHistory.update.mockResolvedValue(sync);
      prisma.cmsCollection.update.mockResolvedValue(mockCollection());

      await service.completeSync('sync_01', {
        status: 'error',
        errorMessage: 'API timeout',
        errors: 1,
      });

      expect(prisma.cmsCollection.update).toHaveBeenCalledWith({
        where: { id: 'col_01' },
        data: expect.objectContaining({
          lastSyncStatus: 'error',
          itemCount: { increment: 0 },
        }),
      });
    });
  });

  describe('getSyncHistory', () => {
    it('returns sync history for a collection ordered by startedAt desc', async () => {
      const history = mockSyncHistoryList();
      prisma.cmsSyncHistory.findMany.mockResolvedValue(history);

      const result = await service.getSyncHistory('col_01');

      expect(prisma.cmsSyncHistory.findMany).toHaveBeenCalledWith({
        where: { collectionId: 'col_01' },
        orderBy: { startedAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(history);
    });

    it('filters by status when provided', async () => {
      prisma.cmsSyncHistory.findMany.mockResolvedValue([]);

      await service.getSyncHistory('col_01', 'error');

      expect(prisma.cmsSyncHistory.findMany).toHaveBeenCalledWith({
        where: { collectionId: 'col_01', status: 'error' },
        orderBy: { startedAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('getPendingSyncs', () => {
    it('returns in_progress syncs that are not yet abandoned', async () => {
      const recent = mockSyncHistory({ startedAt: new Date() });
      prisma.cmsSyncHistory.findMany.mockResolvedValue([recent]);

      const result = await service.getPendingSyncs();

      expect(prisma.cmsSyncHistory.findMany).toHaveBeenCalledWith({
        where: {
          status: 'in_progress',
          completedAt: null,
          startedAt: { gte: expect.any(Date) },
        },
        include: { collection: true },
        orderBy: { startedAt: 'asc' },
        take: 10,
      });
      expect(result).toHaveLength(1);
    });

    it('excludes syncs older than 30 minutes', async () => {
      const cutoff = new Date(Date.now() - 31 * 60 * 1000);
      const old = mockSyncHistory({ startedAt: cutoff });
      prisma.cmsSyncHistory.findMany.mockResolvedValue([]);

      const result = await service.getPendingSyncs();

      const callArg = prisma.cmsSyncHistory.findMany.mock.calls[0][0];
      const startedAtGte = (callArg as any).where.startedAt.gte as Date;
      expect(startedAtGte.getTime()).toBeGreaterThan(cutoff.getTime());
      expect(result).toHaveLength(0);
    });
  });

  describe('getAbandonedSyncs', () => {
    it('returns in_progress syncs older than 30 minutes', async () => {
      const cutoff = new Date(Date.now() - 31 * 60 * 1000);
      const old = mockSyncHistory({ startedAt: cutoff });
      prisma.cmsSyncHistory.findMany.mockResolvedValue([old]);

      const result = await service.getAbandonedSyncs();

      expect(prisma.cmsSyncHistory.findMany).toHaveBeenCalledWith({
        where: {
          status: 'in_progress',
          completedAt: null,
          startedAt: { lt: expect.any(Date) },
        },
        take: 50,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('markAbandoned', () => {
    it('marks a sync as error with abandoned message', async () => {
      prisma.cmsSyncHistory.update.mockResolvedValue(mockSyncHistory());

      await service.markAbandoned('sync_01');

      expect(prisma.cmsSyncHistory.update).toHaveBeenCalledWith({
        where: { id: 'sync_01' },
        data: {
          status: 'error',
          completedAt: expect.any(Date),
          errorMessage: 'Sync abandoned — no completion received within 30 minutes',
        },
      });
    });
  });

  describe('cleanupOldRecords', () => {
    it('deletes records older than 30 days', async () => {
      prisma.cmsSyncHistory.deleteMany.mockResolvedValue({ count: 5 });
      prisma.cmsCollection.findMany.mockResolvedValue([]);

      await service.cleanupOldRecords();

      expect(prisma.cmsSyncHistory.deleteMany).toHaveBeenCalled();
    });

    it('trims excess records per collection (keeps last 100)', async () => {
      prisma.cmsSyncHistory.deleteMany.mockResolvedValue({ count: 0 });
      prisma.cmsCollection.findMany.mockResolvedValue([
        { id: 'col_01', _count: { syncHistory: 150 } } as any,
      ]);
      prisma.cmsSyncHistory.findMany.mockResolvedValue(
        Array.from({ length: 50 }, (_, i) => ({ id: `old_sync_${i}` })) as any,
      );
      prisma.cmsSyncHistory.deleteMany.mockResolvedValue({ count: 50 });

      await service.cleanupOldRecords();

      expect(prisma.cmsSyncHistory.findMany).toHaveBeenCalledWith({
        where: { collectionId: 'col_01', completedAt: { not: null } },
        orderBy: { startedAt: 'asc' },
        take: 50,
        select: { id: true },
      });
    });
  });

  describe('getStats', () => {
    it('aggregates stats across collections', async () => {
      prisma.cmsCollection.findMany.mockResolvedValue(mockCollectionList());

      const result = await service.getStats('default');

      expect(result).toEqual({
        totalCollections: 3,
        totalItems: 192,
        lastSyncAt: expect.any(String),
        activeErrors: 1,
      });
      expect(new Date(result.lastSyncAt!).getTime()).toBe(new Date('2026-01-02').getTime());
    });

    it('handles empty projects', async () => {
      prisma.cmsCollection.findMany.mockResolvedValue([]);

      const result = await service.getStats('empty');

      expect(result).toEqual({
        totalCollections: 0,
        totalItems: 0,
        lastSyncAt: undefined,
        activeErrors: 0,
      });
    });
  });
});
