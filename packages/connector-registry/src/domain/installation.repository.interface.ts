import { ConnectorInstallationEntity } from './connector-installation.entity';

export interface IInstallationRepository {
  findById(id: string): Promise<ConnectorInstallationEntity | null>;
  findByProject(projectId: string): Promise<ConnectorInstallationEntity[]>;
  findByName(projectId: string, name: string): Promise<ConnectorInstallationEntity | null>;
  findByCategory(projectId: string, category: string): Promise<ConnectorInstallationEntity[]>;
  create(input: Partial<ConnectorInstallationEntity>): Promise<ConnectorInstallationEntity>;
  update(id: string, data: Partial<ConnectorInstallationEntity>): Promise<ConnectorInstallationEntity>;
  delete(id: string): Promise<void>;
  countByProject(projectId: string): Promise<number>;
}
