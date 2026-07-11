export interface SecretEntity {
  id: string;
  name: string;
  encryptedValue: string;
  provider: 'project' | 'connector' | 'global';
  projectId?: string;
  connectorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISecretRepository {
  findById(id: string): Promise<SecretEntity | null>;
  findByName(name: string, projectId?: string): Promise<SecretEntity | null>;
  findByProject(projectId: string): Promise<SecretEntity[]>;
  findByConnector(connectorId: string): Promise<SecretEntity[]>;
  create(input: Omit<SecretEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecretEntity>;
  update(id: string, data: Partial<SecretEntity>): Promise<SecretEntity>;
  delete(id: string): Promise<void>;
}
