import { Injectable, Inject } from '@nestjs/common';
import { ILiveQueryExecutor } from '../domain/live-query.executor.interface';
import { QueryExecuteRequest, QueryResult } from '@forge/reactive-types';

@Injectable()
export class LiveQueryService {
  constructor(
    @Inject('ILiveQueryExecutor')
    private readonly executor: ILiveQueryExecutor,
  ) {}

  async execute(request: QueryExecuteRequest): Promise<QueryResult> {
    return this.executor.execute(request);
  }

  async estimateCount(request: QueryExecuteRequest): Promise<number> {
    return this.executor.estimateCount(request);
  }
}
