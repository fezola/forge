import { QueryResult } from '@forge/types';

export interface IQueryExecutor {
  execute(databaseId: string, sql: string): Promise<QueryResult>;
  testConnection(databaseId: string): Promise<boolean>;
}
