import { CustomConnectorEntity } from './custom-connector.entity';

export interface ICustomConnectorRepository {
  findById(id: string): Promise<CustomConnectorEntity | null>;
  findByProject(projectId: string): Promise<CustomConnectorEntity[]>;
  create(entity: CustomConnectorEntity): Promise<CustomConnectorEntity>;
  update(id: string, data: Partial<CustomConnectorEntity>): Promise<CustomConnectorEntity>;
  delete(id: string): Promise<void>;
}
