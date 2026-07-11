export type DatabaseEngine = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';

export interface Database {
  id: string;
  name: string;
  engine: DatabaseEngine;
  url?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface CreateDatabaseInput {
  name: string;
  engine: DatabaseEngine;
  url?: string;
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
  fields: string[];
  duration: number;
}
