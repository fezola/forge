import { CmsService } from '../presentation/cms.service';
import { SyncProcessor } from '../presentation/sync-processor.service';
import { createMockPrisma, MockPrisma, mockCollection, mockSyncHistory } from './mocks';

describe('SyncProcessor', () => {
  let processor: SyncProcessor;
  let service: CmsService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new CmsService(prisma as any);
    processor = new SyncProcessor(service);

    jest.useFakeTimers();
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] }),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('onModuleInit', () => {
    it('starts polling intervals', () => {
      const processSpy = jest.spyOn(processor as any, 'processPending').mockImplementation(() => Promise.resolve());
      const cleanupSpy = jest.spyOn(processor as any, 'cleanup').mockImplementation(() => Promise.resolve());

      processor.onModuleInit();

      expect(processSpy).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      expect(processSpy).toHaveBeenCalled();
    });
  });

  describe('processPending', () => {
    it('marks abandoned syncs and processes pending ones', async () => {
      const abandoned = mockSyncHistory({ id: 'abandoned_01', startedAt: new Date(Date.now() - 60 * 60 * 1000) });
      const pending = mockSyncHistory({
        id: 'sync_02',
        startedAt: new Date(),
        collection: mockCollection({ forgeApiKey: 'sk-test', forgeBaseUrl: 'https://forge.test' }),
      });
      prisma.cmsSyncHistory.findMany
        .mockResolvedValueOnce([abandoned])
        .mockResolvedValueOnce([pending]);
      prisma.cmsSyncHistory.update.mockResolvedValue(pending);
      prisma.cmsCollection.update.mockResolvedValue(pending.collection);

      await (processor as any).processPending();

      expect(prisma.cmsSyncHistory.update).toHaveBeenCalledWith({
        where: { id: 'abandoned_01' },
        data: expect.objectContaining({ status: 'error', errorMessage: expect.stringContaining('abandoned') }),
      });
      expect(global.fetch).toHaveBeenCalled();
      expect(prisma.cmsSyncHistory.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { id: 'sync_02' }, data: expect.objectContaining({ status: 'success' }) }),
      );
    });

    it('handles syncs without forge credentials', async () => {
      const pending = mockSyncHistory({
        id: 'sync_no_creds',
        startedAt: new Date(),
        collection: mockCollection({ forgeApiKey: null, forgeBaseUrl: null }),
      });
      prisma.cmsSyncHistory.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([pending]);
      prisma.cmsSyncHistory.update.mockResolvedValue(pending);

      await (processor as any).processPending();

      expect(prisma.cmsSyncHistory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sync_no_creds' },
          data: expect.objectContaining({
            status: 'error',
            errorMessage: expect.stringContaining('Forge API credentials'),
          }),
        }),
      );
    });

    it('handles fetch errors gracefully', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
      const pending = mockSyncHistory({
        id: 'sync_fail',
        startedAt: new Date(),
        collection: mockCollection({ forgeApiKey: 'sk-test', forgeBaseUrl: 'https://forge.test' }),
      });
      prisma.cmsSyncHistory.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([pending]);
      prisma.cmsSyncHistory.update.mockResolvedValue(pending);

      await (processor as any).processPending();

      expect(prisma.cmsSyncHistory.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: { id: 'sync_fail' },
          data: expect.objectContaining({ status: 'error', errorMessage: 'Network error' }),
        }),
      );
    });

    it('handles empty pending list', async () => {
      prisma.cmsSyncHistory.findMany.mockResolvedValue([]).mockResolvedValueOnce([]);

      await (processor as any).processPending();

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('fetchForgeData', () => {
    it('fetches rows from Forge API', async () => {
      const collection = mockCollection({ forgeApiKey: 'sk-test', forgeBaseUrl: 'https://forge.test', sourceTableId: 'users' });

      const result = await (processor as any).fetchForgeData(collection);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://forge.test/api/v1/projects/default/tables/users/rows',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer sk-test' }),
        }),
      );
      expect(result).toEqual([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    });

    it('returns empty array when no sourceTableId', async () => {
      const collection = mockCollection({ sourceTableId: null });

      const result = await (processor as any).fetchForgeData(collection);

      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('throws on non-ok response', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, statusText: 'Unauthorized' } as any);
      const collection = mockCollection({ forgeApiKey: 'bad-key', forgeBaseUrl: 'https://forge.test', sourceTableId: 'users' });

      await expect((processor as any).fetchForgeData(collection)).rejects.toThrow('Unauthorized');
    });
  });

  describe('processRows', () => {
    it('transforms rows according to field mappings', () => {
      const rows = [
        { name: 'Alice', email: 'alice@test.com', age: 30 },
        { name: 'Bob', email: 'bob@test.com', age: 25 },
      ];
      const mapping = [
        { forgeFieldId: 'name', cmsFieldName: 'Full Name' },
        { forgeFieldId: 'email', cmsFieldName: 'Email' },
      ];

      const result = (processor as any).processRows(rows, mapping);

      expect(result.added).toBe(2);
      expect(result.transformed).toBe(2);
    });

    it('returns metrics even with empty rows', () => {
      const result = (processor as any).processRows([], []);

      expect(result).toEqual({ added: 0, updated: 0, removed: 0, errors: 0, transformed: 0 });
    });

    it('handles nested field paths', () => {
      const rows = [{ user: { name: 'Alice', profile: { age: 30 } } }];
      const mapping = [
        { forgeFieldId: 'user.name', cmsFieldName: 'Name' },
        { forgeFieldId: 'user.profile.age', cmsFieldName: 'Age' },
      ];

      const result = (processor as any).processRows(rows, mapping);

      expect(result.transformed).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('deletes old records and logs count', async () => {
      prisma.cmsSyncHistory.deleteMany.mockResolvedValue({ count: 10 });
      prisma.cmsCollection.findMany.mockResolvedValue([]);

      await (processor as any).cleanup();

      expect(prisma.cmsSyncHistory.deleteMany).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('clears intervals', () => {
      processor.onModuleInit();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      processor.onModuleDestroy();

      expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
    });
  });
});
