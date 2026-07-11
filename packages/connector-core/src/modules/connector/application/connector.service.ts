import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IConnectorRepository } from '../domain/connector.repository.interface';
import { IConnectorExecutor } from '../domain/connector-executor.interface';
import { CreateConnectorInput } from '@forge/types';

@Injectable()
export class ConnectorService {
  constructor(
    @Inject('IConnectorRepository')
    private readonly connectorRepository: IConnectorRepository,
    @Inject('IConnectorExecutor')
    private readonly connectorExecutor: IConnectorExecutor,
  ) {}

  async list(projectId: string) {
    return this.connectorRepository.findByProjectId(projectId);
  }

  async get(id: string) {
    const connector = await this.connectorRepository.findById(id);
    if (!connector) throw new NotFoundException('Connector not found');
    return connector;
  }

  async create(projectId: string, input: CreateConnectorInput) {
    return this.connectorRepository.create(projectId, input);
  }

  async update(id: string, input: Partial<CreateConnectorInput>) {
    return this.connectorRepository.update(id, input);
  }

  async delete(id: string) {
    await this.connectorRepository.delete(id);
  }

  async execute(id: string, payload?: unknown) {
    const connector = await this.connectorRepository.findById(id);
    if (!connector) throw new NotFoundException('Connector not found');
    return this.connectorExecutor.execute(connector, payload);
  }
}
