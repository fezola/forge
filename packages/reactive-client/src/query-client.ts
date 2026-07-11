import { ReactiveClientConfig } from './reactive-client';
import { QueryExecuteRequest, QueryResult } from '@forge/reactive-types';

export class QueryClient {
  constructor(private config: ReactiveClientConfig) {}

  async execute(request: QueryExecuteRequest): Promise<QueryResult> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/queries/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async count(request: QueryExecuteRequest): Promise<number> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/queries/count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify(request),
    });
    const result = await response.json();
    return result.total || 0;
  }
}
