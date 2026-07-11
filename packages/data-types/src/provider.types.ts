import type { DataQuery, QueryContext, QueryResult, DataSearchQuery } from './query.types';
import type { DataRecord } from './record.types';
import type { FieldDefinition, IndexDefinition, RelationshipDefinition, TableDefinition } from './table.types';

export type DataProviderType = 'forge_managed' | 'postgresql' | 'mysql' | 'mongodb' | 'supabase' | 'firebase' | 'neon' | 'planetscale' | 'sqlite' | 'custom';

export type DataProviderStatus = 'connected' | 'disconnected' | 'error' | 'migrating';

export interface DataProvider {
  id: string;
  projectId: string;
  type: DataProviderType;
  name: string;
  status: DataProviderStatus;
  config: DataProviderConfig;
  tables: string[];
  capabilities: ProviderCapabilities;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DataProviderConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
  region?: string;
  apiKey?: string;
  projectRef?: string;
  serviceKey?: string;
  schema?: string;
  additional?: Record<string, unknown>;
}

export interface ProviderCapabilities {
  supportsRealtime: boolean;
  supportsSearch: boolean;
  supportsTransactions: boolean;
  supportsForeignKeys: boolean;
  supportsViews: boolean;
  supportsFunctions: boolean;
  supportsAggregations: boolean;
  supportsFullTextSearch: boolean;
  supportsJsonFields: boolean;
  supportsArrayFields: boolean;
  maxQueryLimit: number;
  supportedFieldTypes: string[];
}

export interface ISchemaProvider {
  readonly type: DataProviderType;
  readonly supportsManaged: boolean;
  connect(config: DataProviderConfig): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(config: DataProviderConfig): Promise<{ success: boolean; error?: string }>;
  getCapabilities(): ProviderCapabilities;
  listTables(): Promise<Array<{ name: string; rowCount?: number }>>;
  getTableSchema(tableName: string): Promise<Array<{ name: string; type: string; required: boolean }>>;
}

export interface IDataProvider {
  readonly type: DataProviderType;
  readonly provider: ISchemaProvider;
  initialize(config: DataProviderConfig): Promise<void>;
  destroy(): Promise<void>;
  query<T = unknown>(tableName: string, query: DataQuery, context?: QueryContext): Promise<QueryResult<T>>;
  createRecord(tableName: string, fields: Record<string, unknown>, context?: QueryContext): Promise<DataRecord>;
  updateRecord(tableName: string, id: string, fields: Record<string, unknown>, context?: QueryContext): Promise<DataRecord>;
  deleteRecord(tableName: string, id: string, context?: QueryContext): Promise<void>;
  createTable(definition: TableDefinition): Promise<void>;
  alterTable(tableName: string, changes: TableAlteration[]): Promise<void>;
  dropTable(tableName: string): Promise<void>;
  search(tableName: string, query: DataSearchQuery, context?: QueryContext): Promise<QueryResult<DataRecord>>;
  beginTransaction(): Promise<ITransaction>;
}

export type TableAlteration =
  | { type: 'add_column'; field: FieldDefinition }
  | { type: 'drop_column'; fieldName: string }
  | { type: 'alter_column'; fieldName: string; changes: Partial<FieldDefinition> }
  | { type: 'add_index'; index: IndexDefinition }
  | { type: 'drop_index'; indexName: string }
  | { type: 'add_foreign_key'; relationship: RelationshipDefinition }
  | { type: 'drop_foreign_key'; constraintName: string };

export interface ITransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

export interface IDataProviderRegistry {
  register(provider: IDataProvider): void;
  get(type: DataProviderType): IDataProvider | null;
  getAll(): IDataProvider[];
  getForProject(projectId: string): Promise<DataProvider[]>;
  connectProjectProvider(projectId: string, providerId: string): Promise<void>;
  disconnectProjectProvider(projectId: string, providerId: string): Promise<void>;
}