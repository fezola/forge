import { Injectable, Inject } from '@nestjs/common';
import {
  DataQuery, DataFilter, DataAggregation, DataSearchQuery,
  QueryResult, QueryContext, DataRecord, DataError, DataPagination,
} from '@forge/data-types';
import type { IDataProviderRegistry } from '@forge/data-types';
import { IQueryTranslator } from '../domain/query-interfaces';

@Injectable()
export class QueryEngineService {
  private translators: IQueryTranslator[] = [];

  constructor(
    @Inject('IDataProviderRegistry')
    private readonly providerRegistry: IDataProviderRegistry,
  ) {}

  registerTranslator(translator: IQueryTranslator): void {
    this.translators.push(translator);
  }

  async execute(
    tableName: string,
    query: DataQuery,
    context?: QueryContext,
  ): Promise<QueryResult<DataRecord>> {
    this.validatePagination(query.pagination);
    const provider = await this.resolveProvider(tableName, context?.projectId);
    return provider.query(tableName, query, context);
  }

  async count(
    tableName: string,
    filter?: DataFilter,
    context?: QueryContext,
  ): Promise<number> {
    const provider = await this.resolveProvider(tableName, context?.projectId);
    const result = await provider.query(tableName, { filter, pagination: { offset: 0, limit: 1 } }, context);
    return (result as any).total ?? 0;
  }

  async search(
    tableName: string,
    query: DataSearchQuery,
    context?: QueryContext,
  ): Promise<QueryResult<DataRecord>> {
    if (!query.query || query.query.trim().length === 0) {
      throw new DataError('INVALID_QUERY', 'Search query is required', 400);
    }
    this.validatePagination(query.pagination);
    const provider = await this.resolveProvider(tableName, context?.projectId);
    return provider.search(tableName, query, context);
  }

  async aggregate(
    tableName: string,
    aggregations: DataAggregation[],
    filter?: DataFilter,
    context?: QueryContext,
  ): Promise<Record<string, number>> {
    if (aggregations.length === 0) {
      throw new DataError('INVALID_QUERY', 'At least one aggregation is required', 400);
    }
    const provider = await this.resolveProvider(tableName, context?.projectId);
    const result = await provider.query(
      tableName,
      { filter, aggregations, pagination: { offset: 0, limit: 0 } },
      context,
    );
    return (result as any).aggregations ?? {};
  }

  async findById(
    tableName: string,
    id: string,
    context?: QueryContext,
  ): Promise<DataRecord | null> {
    const provider = await this.resolveProvider(tableName, context?.projectId);
    const filter: DataFilter = { fieldId: 'id', operator: 'eq', value: id };
    const result = await provider.query(tableName, { filter, pagination: { offset: 0, limit: 1 } }, context);
    return (result as any).items?.[0] ?? null;
  }

  private validatePagination(pagination?: DataPagination): void {
    if (pagination) {
      if (pagination.limit > 1000) {
        throw new DataError('QUERY_LIMIT_EXCEEDED', 'Maximum query limit is 1000 records', 400);
      }
    }
  }

  private async resolveProvider(_tableName: string, projectId?: string): Promise<IDataProviderPort> {
    const providers = this.providerRegistry.getAll();
    const forgeManaged = providers.find((p: any) => p.type === 'forge_managed');
    if (forgeManaged) return forgeManaged as any;
    if (projectId) {
      const projectProviders = await this.providerRegistry.getForProject(projectId);
      if (projectProviders.length > 0) return projectProviders[0] as any;
    }
    throw new DataError('PROVIDER_NOT_FOUND', 'No data provider available', 500);
  }
}

interface IDataProviderPort {
  type: string;
  query(table: string, query: any, context?: any): Promise<any>;
  search(table: string, query: any, context?: any): Promise<any>;
}