import type {
  DataQuery, DataSearchQuery, DataFilter, DataSort, DataPagination, DataAggregation, QueryContext,
} from '@forge/data-types';

export interface IQueryTranslator {
  canHandle(providerType: string): boolean;
  translate(query: DataQuery, tableName: string, context?: QueryContext): { sql: string; params: unknown[] };
  translateSearch(query: DataSearchQuery, tableName: string, context?: QueryContext): { sql: string; params: unknown[] };
  translateCount(tableName: string, filter?: DataFilter, context?: QueryContext): { sql: string; params: unknown[] };
  translateAggregation(tableName: string, aggregations: DataAggregation[], filter?: DataFilter, context?: QueryContext): { sql: string; params: unknown[] };
}

export interface IQueryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IQueryValidator {
  validate(query: DataQuery, tableName: string): IQueryValidationResult;
  validateFilter(filter: DataFilter, tableName: string): string[];
  validateSorts(sorts: DataSort[], tableName: string): string[];
  validatePagination(pagination: DataPagination): string[];
}