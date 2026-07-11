import type { DataQuery, QueryResult, DataFilter, DataSearchQuery } from './query.types';

export interface DataRecord {
  id: string;
  tableId: string;
  fields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
}

export interface CreateRecordRequest {
  tableId: string;
  fields: Record<string, unknown>;
  createdBy?: string;
}

export interface UpdateRecordRequest {
  id: string;
  fields: Record<string, unknown>;
  updatedBy?: string;
}

export interface BulkCreateRecordsRequest {
  tableId: string;
  records: Array<Record<string, unknown>>;
  createdBy?: string;
}

export interface BulkUpdateRecordsRequest {
  tableId: string;
  records: Array<{ id: string; fields: Record<string, unknown> }>;
  updatedBy?: string;
}

export interface BulkDeleteRequest {
  tableId: string;
  ids: string[];
}

export interface IRecordRepository {
  findById(tableId: string, id: string): Promise<DataRecord | null>;
  find(tableId: string, query: DataQuery): Promise<QueryResult<DataRecord>>;
  create(request: CreateRecordRequest): Promise<DataRecord>;
  update(request: UpdateRecordRequest): Promise<DataRecord>;
  delete(tableId: string, id: string): Promise<void>;
  bulkCreate(request: BulkCreateRecordsRequest): Promise<DataRecord[]>;
  bulkUpdate(request: BulkUpdateRecordsRequest): Promise<DataRecord[]>;
  bulkDelete(request: BulkDeleteRequest): Promise<number>;
  count(tableId: string, filter?: DataFilter): Promise<number>;
  search(tableId: string, query: DataSearchQuery): Promise<QueryResult<DataRecord>>;
}