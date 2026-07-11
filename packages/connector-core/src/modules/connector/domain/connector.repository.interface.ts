import { Connector, CreateConnectorInput } from '@forge/types';

export interface IConnectorRepository {
  findByProjectId(projectId: string): Promise<Connector[]>;
  findById(id: string): Promise<Connector | null>;
  create(projectId: string, input: CreateConnectorInput): Promise<Connector>;
  update(id: string, input: Partial<CreateConnectorInput>): Promise<Connector>;
  delete(id: string): Promise<void>;
}
