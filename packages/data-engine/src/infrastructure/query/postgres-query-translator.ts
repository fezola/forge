import { Injectable } from '@nestjs/common';
import {
  DataQuery, DataFilter, DataAggregation, DataSearchQuery,
  QueryContext,
} from '@forge/data-types';
import { IQueryTranslator } from '../../domain/query-interfaces';

@Injectable()
export class PostgresQueryTranslator implements IQueryTranslator {
  canHandle(providerType: string): boolean {
    return ['forge_managed', 'postgresql', 'supabase', 'neon', 'planetscale'].includes(providerType);
  }

  translate(query: DataQuery, tableName: string, _context?: QueryContext): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    let paramIndex = 1;

    const selectClause = query.fields && query.fields.length > 0
      ? query.fields.map((f: string) => `"${f}"`).join(', ')
      : '*';

    let sql = `SELECT ${selectClause} FROM "${tableName}"`;

    if (query.filter) {
      const where = this.buildWhere(query.filter, params, paramIndex);
      sql += ` WHERE ${where.clause}`;
      paramIndex = where.nextIndex;
    }

    if (query.sorts && query.sorts.length > 0) {
      const orderClauses = query.sorts.map((s: { fieldId: string; direction: string }) =>
        `"${s.fieldId}" ${s.direction === 'desc' ? 'DESC' : 'ASC'}`
      );
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    if (query.pagination) {
      sql += ` LIMIT ${query.pagination.limit} OFFSET ${query.pagination.offset}`;
    }

    return { sql, params };
  }

  translateSearch(query: DataSearchQuery, tableName: string, _context?: QueryContext): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const searchFields = query.fields && query.fields.length > 0
      ? query.fields.map((f: string) => `"${f}"`).join(', ')
      : '*';

    const conditions: string[] = [];
    if (query.fields && query.fields.length > 0) {
      const searchTerms = query.query.split(/\s+/).filter(Boolean).map((t: string) => `%${t}%`);
      for (const field of query.fields) {
        for (const term of searchTerms) {
          conditions.push(`"${field}" ILIKE $${params.length + 1}`);
          params.push(term);
        }
      }
    }

    let sql = `SELECT ${searchFields} FROM "${tableName}"`;
    if (conditions.length > 0) {
      sql += ` WHERE (${conditions.join(' OR ')})`;
    }

    if (query.sorts && query.sorts.length > 0) {
      const orderClauses = query.sorts.map((s: { fieldId: string; direction: string }) =>
        `"${s.fieldId}" ${s.direction === 'desc' ? 'DESC' : 'ASC'}`
      );
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    if (query.pagination) {
      sql += ` LIMIT ${query.pagination.limit} OFFSET ${query.pagination.offset}`;
    }

    return { sql, params };
  }

  translateCount(tableName: string, filter?: DataFilter, _context?: QueryContext): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    let sql = `SELECT COUNT(*) as count FROM "${tableName}"`;
    if (filter) {
      const where = this.buildWhere(filter, params, 1);
      sql += ` WHERE ${where.clause}`;
    }
    return { sql, params };
  }

  translateAggregation(tableName: string, aggregations: DataAggregation[], filter?: DataFilter, _context?: QueryContext): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const aggClauses = aggregations.map((a: DataAggregation) => {
      switch (a.function) {
        case 'count': return `COUNT(*)`;
        case 'count_distinct': return `COUNT(DISTINCT "${a.fieldId}")`;
        case 'sum': return `SUM("${a.fieldId}")`;
        case 'avg': return `AVG("${a.fieldId}")`;
        case 'min': return `MIN("${a.fieldId}")`;
        case 'max': return `MAX("${a.fieldId}")`;
        default: return `COUNT(*)`;
      }
    });

    let sql = `SELECT ${aggClauses.join(', ')} FROM "${tableName}"`;
    if (filter) {
      const where = this.buildWhere(filter, params, 1);
      sql += ` WHERE ${where.clause}`;
    }
    return { sql, params };
  }

  private buildWhere(
    filter: DataFilter,
    params: unknown[],
    startIndex: number,
  ): { clause: string; nextIndex: number } {
    let index = startIndex;
    const { fieldId, operator, value, filters } = filter;

    if (operator === 'and' || operator === 'or') {
      if (!filters || filters.length === 0) return { clause: '1=1', nextIndex: index };
      const parts: string[] = [];
      for (const sub of filters) {
        const result = this.buildWhere(sub, params, index);
        parts.push(result.clause);
        index = result.nextIndex;
      }
      return { clause: `(${parts.join(` ${operator.toUpperCase()} `)})`, nextIndex: index };
    }

    if (operator === 'not') {
      if (!filters || filters.length === 0) return { clause: '1=1', nextIndex: index };
      const result = this.buildWhere(filters[0], params, index);
      return { clause: `NOT (${result.clause})`, nextIndex: result.nextIndex };
    }

    if (!fieldId) return { clause: '1=1', nextIndex: index };
    const col = `"${fieldId}"`;
    let clause: string;

    switch (operator) {
      case 'eq':
        clause = value === null ? `${col} IS NULL` : `${col} = $${index++}`;
        if (value !== null) params.push(value);
        break;
      case 'neq':
        clause = value === null ? `${col} IS NOT NULL` : `${col} != $${index++}`;
        if (value !== null) params.push(value);
        break;
      case 'gt': clause = `${col} > $${index++}`; params.push(value); break;
      case 'gte': clause = `${col} >= $${index++}`; params.push(value); break;
      case 'lt': clause = `${col} < $${index++}`; params.push(value); break;
      case 'lte': clause = `${col} <= $${index++}`; params.push(value); break;
      case 'in': clause = `${col} = ANY($${index++})`; params.push(value); break;
      case 'not_in': clause = `NOT (${col} = ANY($${index++}))`; params.push(value); break;
      case 'contains': clause = `${col} ILIKE $${index++}`; params.push(`%${value}%`); break;
      case 'not_contains': clause = `${col} NOT ILIKE $${index++}`; params.push(`%${value}%`); break;
      case 'starts_with': clause = `${col} ILIKE $${index++}`; params.push(`${value}%`); break;
      case 'ends_with': clause = `${col} ILIKE $${index++}`; params.push(`%${value}`); break;
      case 'is_null': clause = `${col} IS NULL`; break;
      case 'is_not_null': clause = `${col} IS NOT NULL`; break;
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          clause = `${col} BETWEEN $${index++} AND $${index++}`;
          params.push(value[0], value[1]);
        } else {
          clause = '1=1';
        }
        break;
      default: clause = '1=1';
    }

    return { clause, nextIndex: index };
  }
}