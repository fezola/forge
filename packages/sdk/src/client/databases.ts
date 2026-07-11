import { BaseApi } from './base';
import type { Database, CreateDatabaseInput, QueryResult } from '@forge/types';

export class DatabaseApi extends BaseApi {
  async list(projectId: string): Promise<Database[]> {
    const result = await this.get<{ data: Database[] }>(`/projects/${projectId}/databases`);
    return result.data;
  }

  async create(projectId: string, input: CreateDatabaseInput): Promise<Database> {
    const result = await this.post<{ data: Database }>(`/projects/${projectId}/databases`, input);
    return result.data;
  }

  async query(projectId: string, databaseId: string, sql: string): Promise<QueryResult> {
    const result = await this.post<{ data: QueryResult }>(
      `/projects/${projectId}/databases/${databaseId}/query`,
      { sql },
    );
    return result.data;
  }
}
