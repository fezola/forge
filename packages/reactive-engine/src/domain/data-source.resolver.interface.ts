import { DataSourceType } from '@forge/reactive-types';

export interface IDataSourceResolver {
  canResolve(type: DataSourceType): boolean;
  resolve(source: { type: DataSourceType; config: Record<string, unknown>; path?: string }, context: Record<string, unknown>): Promise<unknown>;
  getSchema(type: DataSourceType): Promise<{ fields: Array<{ name: string; type: string; path: string }> } | null>;
}
