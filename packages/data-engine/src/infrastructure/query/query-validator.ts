import { Injectable } from '@nestjs/common';
import type {
  DataQuery, DataFilter, DataSort, DataPagination,
} from '@forge/data-types';
import { IQueryValidator, IQueryValidationResult } from '../../domain/query-interfaces';

const LEAF_OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_null', 'is_not_null', 'between'];
const LOGICAL_OPS = ['and', 'or', 'not'];

@Injectable()
export class QueryValidator implements IQueryValidator {
  private readonly MAX_LIMIT = 1000;
  private readonly MAX_DEPTH = 5;
  private readonly MAX_SORTS = 10;

  validate(query: DataQuery, _tableName: string): IQueryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (query.filter) errors.push(...this.checkFilter(query.filter));
    if (query.sorts) errors.push(...this.checkSorts(query.sorts));
    if (query.pagination) errors.push(...this.checkPagination(query.pagination));
    if (query.aggregations && query.aggregations.length > 10) {
      warnings.push('More than 10 aggregations may impact performance');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateFilter(filter: DataFilter, _tableName: string): string[] {
    return this.checkFilter(filter);
  }

  validateSorts(sorts: DataSort[], _tableName: string): string[] {
    return this.checkSorts(sorts);
  }

  validatePagination(pagination: DataPagination): string[] {
    return this.checkPagination(pagination);
  }

  private checkFilter(filter: DataFilter): string[] {
    const errors: string[] = [];
    const depth = this.getDepth(filter);
    if (depth > this.MAX_DEPTH) {
      errors.push(`Filter nesting depth (${depth}) exceeds maximum (${this.MAX_DEPTH})`);
    }
    this.validateNode(filter, errors);
    return errors;
  }

  private validateNode(filter: DataFilter, errors: string[]): void {
    if (LOGICAL_OPS.includes(filter.operator)) {
      if (!filter.filters || filter.filters.length === 0) {
        errors.push(`Logical operator '${filter.operator}' requires at least one sub-filter`);
      }
      for (const sub of filter.filters ?? []) {
        this.validateNode(sub, errors);
      }
    } else if (LEAF_OPS.includes(filter.operator)) {
      if (!filter.fieldId) errors.push('Filter requires fieldId for leaf operators');
      if (!['is_null', 'is_not_null'].includes(filter.operator) && filter.value === undefined) {
        errors.push(`Operator '${filter.operator}' requires a value`);
      }
    } else {
      errors.push(`Unknown operator '${filter.operator}'`);
    }
  }

  private checkSorts(sorts: DataSort[]): string[] {
    const errors: string[] = [];
    if (sorts.length > this.MAX_SORTS) {
      errors.push(`Maximum of ${this.MAX_SORTS} sort fields allowed`);
    }
    for (const sort of sorts) {
      if (!['asc', 'desc'].includes(sort.direction)) {
        errors.push(`Invalid sort direction '${sort.direction}'. Use 'asc' or 'desc'`);
      }
    }
    return errors;
  }

  private checkPagination(pagination: DataPagination): string[] {
    const errors: string[] = [];
    if (pagination.limit < 1) errors.push('Limit must be at least 1');
    if (pagination.limit > this.MAX_LIMIT) errors.push(`Limit (${pagination.limit}) exceeds maximum (${this.MAX_LIMIT})`);
    if (pagination.offset < 0) errors.push('Offset must be non-negative');
    return errors;
  }

  private getDepth(filter: DataFilter): number {
    if (!filter.filters || filter.filters.length === 0) return 1;
    return 1 + Math.max(...filter.filters.map((f: DataFilter) => this.getDepth(f)));
  }
}