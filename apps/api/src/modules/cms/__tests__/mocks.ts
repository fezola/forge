import { PrismaClient } from '@prisma/client';

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> | jest.Mock }
  : T;

export const mockDeep = <T extends object>(obj?: DeepPartial<T>): T =>
  new Proxy({} as T, {
    get: (target, prop) => {
      if (prop in target) return (target as any)[prop];
      return jest.fn();
    },
  });

export type MockPrisma = {
  [K in keyof PrismaClient]: PrismaClient[K] extends (...args: any[]) => any
    ? jest.Mock
    : PrismaClient[K] extends object
      ? { [P in keyof PrismaClient[K]]: jest.Mock }
      : jest.Mock;
};

export const createMockPrisma = (): MockPrisma => {
  const prisma = {} as MockPrisma;

  const delegateMethods = [
    'findMany', 'findUnique', 'findFirst', 'create', 'update',
    'delete', 'deleteMany', 'count', 'upsert',
  ];

  const delegates = ['cmsCollection', 'cmsSyncHistory'];
  for (const del of delegates) {
    (prisma as any)[del] = {};
    for (const method of delegateMethods) {
      (prisma as any)[del][method] = jest.fn();
    }
  }

  (prisma as any).$connect = jest.fn();
  (prisma as any).$disconnect = jest.fn();
  (prisma as any).$on = jest.fn();
  (prisma as any).$use = jest.fn();
  (prisma as any).$transaction = jest.fn((cb: any) => cb(prisma));

  return prisma;
};

export const mockCollection = (overrides: Record<string, any> = {}) => ({
  id: 'col_01',
  name: 'Test Collection',
  projectId: 'default',
  sourceTableId: 'table_01',
  forgeApiKey: null,
  forgeBaseUrl: null,
  fieldMapping: [
    { forgeFieldId: 'name', cmsFieldName: 'Name', cmsFieldType: 'string' },
    { forgeFieldId: 'email', cmsFieldName: 'Email', cmsFieldType: 'string' },
  ],
  lastSyncAt: null,
  lastSyncStatus: null,
  lastSyncCount: null,
  itemCount: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  syncHistory: [],
  ...overrides,
});

export const mockSyncHistory = (overrides: Record<string, any> = {}) => ({
  id: 'sync_01',
  collectionId: 'col_01',
  status: 'in_progress',
  startedAt: new Date('2026-01-01T00:00:00Z'),
  completedAt: null,
  itemsAdded: 0,
  itemsUpdated: 0,
  itemsRemoved: 0,
  errors: 0,
  errorMessage: null,
  metadata: null,
  collection: null,
  ...overrides,
});

export const mockCollectionList = () => [
  mockCollection({ id: 'col_01', name: 'Users', sourceTableId: 'users', itemCount: 150, lastSyncStatus: 'success', lastSyncAt: new Date('2026-01-02') }),
  mockCollection({ id: 'col_02', name: 'Orders', sourceTableId: 'orders', itemCount: 42, lastSyncStatus: 'error', lastSyncAt: new Date('2026-01-01') }),
  mockCollection({ id: 'col_03', name: 'Products', sourceTableId: 'products', itemCount: 0, lastSyncStatus: null, lastSyncAt: null }),
];

export const mockSyncHistoryList = () => [
  mockSyncHistory({ id: 'sync_01', status: 'success', completedAt: new Date('2026-01-02T00:05:00Z'), itemsAdded: 10, itemsUpdated: 2, itemsRemoved: 1 }),
  mockSyncHistory({ id: 'sync_02', status: 'success', completedAt: new Date('2026-01-01T00:03:00Z'), itemsAdded: 5, itemsUpdated: 0, itemsRemoved: 0 }),
  mockSyncHistory({ id: 'sync_03', status: 'error', completedAt: new Date('2026-01-01T00:10:00Z'), errors: 1, errorMessage: 'Connection failed' }),
];
