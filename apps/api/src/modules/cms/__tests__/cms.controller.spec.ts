import { Test, TestingModule } from '@nestjs/testing';
import { CmsController } from '../presentation/cms.controller';
import { CmsService } from '../presentation/cms.service';
import { createMockPrisma, MockPrisma, mockCollection, mockSyncHistory, mockCollectionList, mockSyncHistoryList } from './mocks';

describe('CmsController', () => {
  let controller: CmsController;
  let service: CmsService;
  let prisma: MockPrisma;

  beforeEach(async () => {
    prisma = createMockPrisma();
    service = new CmsService(prisma as any);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsController],
      providers: [
        { provide: CmsService, useValue: service },
      ],
    }).compile();

    controller = module.get<CmsController>(CmsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/cms-collections', () => {
    it('returns collections for a project', async () => {
      const collections = mockCollectionList();
      prisma.cmsCollection.findMany.mockResolvedValue(collections);

      const result = await controller.listCollections('default');

      expect(result).toEqual(collections);
      expect(prisma.cmsCollection.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/cms-collections/stats', () => {
    it('returns aggregated stats', async () => {
      prisma.cmsCollection.findMany.mockResolvedValue(mockCollectionList());

      const result = await controller.getStats('default');

      expect(result).toHaveProperty('totalCollections', 3);
      expect(result).toHaveProperty('totalItems', 192);
      expect(result).toHaveProperty('activeErrors', 1);
    });
  });

  describe('GET /api/v1/cms-collections/:id', () => {
    it('returns a single collection', async () => {
      const collection = mockCollection();
      prisma.cmsCollection.findUnique.mockResolvedValue(collection);

      const result = await controller.getCollection('col_01');

      expect(result).toEqual(collection);
    });

    it('returns null for nonexistent collection', async () => {
      prisma.cmsCollection.findUnique.mockResolvedValue(null);

      const result = await controller.getCollection('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('POST /api/v1/cms-collections', () => {
    it('creates a collection', async () => {
      const collection = mockCollection();
      prisma.cmsCollection.create.mockResolvedValue(collection);

      const result = await controller.createCollection({
        name: 'Test Collection',
        projectId: 'default',
        sourceTableId: 'my_table',
      });

      expect(result).toEqual(collection);
      expect(prisma.cmsCollection.create).toHaveBeenCalled();
    });

    it('creates a collection with forge credentials', async () => {
      const collection = mockCollection({ forgeApiKey: 'sk-123', forgeBaseUrl: 'https://forge.dev' });
      prisma.cmsCollection.create.mockResolvedValue(collection);

      const result = await controller.createCollection({
        name: 'With Creds',
        projectId: 'default',
        forgeApiKey: 'sk-123',
        forgeBaseUrl: 'https://forge.dev',
      });

      expect(result.forgeApiKey).toBe('sk-123');
      expect(result.forgeBaseUrl).toBe('https://forge.dev');
    });
  });

  describe('PUT /api/v1/cms-collections/:id', () => {
    it('updates a collection', async () => {
      const updated = mockCollection({ name: 'Renamed' });
      prisma.cmsCollection.update.mockResolvedValue(updated);

      const result = await controller.updateCollection('col_01', { name: 'Renamed' });

      expect(result.name).toBe('Renamed');
    });
  });

  describe('DELETE /api/v1/cms-collections/:id', () => {
    it('deletes a collection', async () => {
      prisma.cmsCollection.delete.mockResolvedValue(mockCollection());

      const result = await controller.deleteCollection('col_01');

      expect(result).toEqual({ success: true });
    });
  });

  describe('POST /api/v1/cms-collections/:id/sync', () => {
    it('triggers a sync', async () => {
      const collection = mockCollection();
      const sync = mockSyncHistory();
      prisma.cmsCollection.findUnique.mockResolvedValue(collection);
      prisma.cmsSyncHistory.create.mockResolvedValue(sync);
      prisma.cmsCollection.update.mockResolvedValue(collection);

      const result = await controller.triggerSync('col_01', { projectId: 'default' });

      expect(result).toEqual({ syncId: 'sync_01' });
    });

    it('throws when collection not found', async () => {
      prisma.cmsCollection.findUnique.mockResolvedValue(null);

      await expect(controller.triggerSync('nonexistent', { projectId: 'default' })).rejects.toThrow('Collection not found');
    });
  });

  describe('GET /api/v1/cms-collections/:id/syncs', () => {
    it('returns sync history', async () => {
      const history = mockSyncHistoryList();
      prisma.cmsSyncHistory.findMany.mockResolvedValue(history);

      const result = await controller.getSyncHistory('col_01');

      expect(result).toHaveLength(3);
    });

    it('filters by status', async () => {
      prisma.cmsSyncHistory.findMany.mockResolvedValue([]);

      await controller.getSyncHistory('col_01', 'error');

      expect(prisma.cmsSyncHistory.findMany).toHaveBeenCalledWith({
        where: { collectionId: 'col_01', status: 'error' },
        orderBy: { startedAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('PATCH /api/v1/cms-collections/:id/syncs/:syncId', () => {
    it('completes a sync with results', async () => {
      const sync = mockSyncHistory({ status: 'success', itemsAdded: 10 });
      prisma.cmsSyncHistory.update.mockResolvedValue(sync);
      prisma.cmsCollection.update.mockResolvedValue(mockCollection());

      const result = await controller.completeSync('sync_01', {
        status: 'success',
        itemsAdded: 10,
      });

      expect(result.status).toBe('success');
    });

    it('completes a sync with error', async () => {
      const sync = mockSyncHistory({ status: 'error', errorMessage: 'Failed' });
      prisma.cmsSyncHistory.update.mockResolvedValue(sync);
      prisma.cmsCollection.update.mockResolvedValue(mockCollection());

      const result = await controller.completeSync('sync_01', {
        status: 'error',
        errorMessage: 'Failed',
      });

      expect(result.status).toBe('error');
    });
  });
});
