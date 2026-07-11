export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'between';

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryPagination {
  page: number;
  limit: number;
}

export interface LiveQuery {
  id: string;
  name: string;
  sourceType: string;
  sourceConfig: Record<string, unknown>;
  filters: QueryFilter[];
  sorts: QuerySort[];
  pagination?: QueryPagination;
  fields?: string[];
}

export interface QueryResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryExecuteRequest {
  sourceType: string;
  sourceConfig: Record<string, unknown>;
  filters?: QueryFilter[];
  sorts?: QuerySort[];
  pagination?: QueryPagination;
  fields?: string[];
}
