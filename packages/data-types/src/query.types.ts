import type { DataRecord } from './record.types';

export type FilterOperator =
  | 'eq' | 'neq'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in'
  | 'contains' | 'not_contains' | 'starts_with' | 'ends_with'
  | 'is_null' | 'is_not_null'
  | 'between'
  | 'and' | 'or' | 'not';

export interface DataFilter {
  fieldId: string;
  operator: FilterOperator;
  value?: unknown;
  filters?: DataFilter[];
}

export interface DataSort {
  fieldId: string;
  direction: 'asc' | 'desc';
}

export interface DataPagination {
  offset: number;
  limit: number;
}

export interface DataAggregation {
  fieldId: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'count_distinct';
  alias?: string;
}

export interface DataQuery {
  filter?: DataFilter;
  sorts?: DataSort[];
  pagination?: DataPagination;
  fields?: string[];
  aggregations?: DataAggregation[];
  groupBy?: string[];
  include?: string[];
}

export interface DataSearchQuery {
  query: string;
  fields?: string[];
  filter?: DataFilter;
  sorts?: DataSort[];
  pagination?: DataPagination;
  highlight?: boolean;
}

export interface QueryResult<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  aggregations?: Record<string, number>;
}

export interface DataCountResult {
  total: number;
  filtered: number;
}

export interface IQueryEngine {
  execute<T = DataRecord>(tableId: string, query: DataQuery, context?: QueryContext): Promise<QueryResult<T>>;
  count(tableId: string, filter?: DataFilter, context?: QueryContext): Promise<number>;
  search(tableId: string, query: DataSearchQuery, context?: QueryContext): Promise<QueryResult<DataRecord>>;
  aggregate(tableId: string, aggregations: DataAggregation[], filter?: DataFilter, context?: QueryContext): Promise<Record<string, number>>;
  executeRaw(sql: string, params?: unknown[]): Promise<unknown>;
}

export interface QueryContext {
  identityId?: string;
  projectId?: string;
  roles?: string[];
  permissions?: string[];
  bypassRls?: boolean;
}