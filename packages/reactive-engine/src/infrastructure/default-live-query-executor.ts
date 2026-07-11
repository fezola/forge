import { Injectable } from '@nestjs/common';
import { ILiveQueryExecutor } from '../domain/live-query.executor.interface';
import { QueryExecuteRequest, QueryResult, QueryFilter } from '@forge/reactive-types';

@Injectable()
export class DefaultLiveQueryExecutor implements ILiveQueryExecutor {
  async execute(request: QueryExecuteRequest): Promise<QueryResult> {
    // Default implementation returns empty — actual delegation to database-engine happens in future
    return {
      items: [],
      total: 0,
      page: request.pagination?.page || 1,
      limit: request.pagination?.limit || 20,
      totalPages: 0,
    };
  }

  async estimateCount(request: QueryExecuteRequest): Promise<number> {
    return 0;
  }
}
