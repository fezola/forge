import { Database, CreateDatabaseInput } from '@forge/types';

export interface IDatabaseRepository {
  findByProjectId(projectId: string): Promise<Database[]>;
  findById(id: string): Promise<Database | null>;
  create(projectId: string, input: CreateDatabaseInput): Promise<Database>;
  delete(id: string): Promise<void>;
}
