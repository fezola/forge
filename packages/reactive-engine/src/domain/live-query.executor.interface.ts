import { QueryExecuteRequest, QueryResult } from '@forge/reactive-types';

export interface ILiveQueryExecutor {
  execute(request: QueryExecuteRequest): Promise<QueryResult>;
  estimateCount(request: QueryExecuteRequest): Promise<number>;
}
