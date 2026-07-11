import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICustomConnectorRepository } from '../domain/custom-connector.repository.interface';
import { CustomConnectorEntity } from '../domain/custom-connector.entity';
import { EndpointEntity } from '../domain/endpoint.entity';
import { ResponseMappingEntity } from '../domain/response-mapping.entity';
import { AuthConfig } from '@forge/connector-sdk';

@Injectable()
export class CustomConnectorService {
  constructor(
    @Inject('ICustomConnectorRepository')
    private readonly repo: ICustomConnectorRepository,
  ) {}

  async create(input: {
    projectId: string;
    name: string;
    description?: string;
    authConfig: AuthConfig;
    baseUrl: string;
    globalHeaders?: Record<string, string>;
  }) {
    const entity = CustomConnectorEntity.create(input);
    return this.repo.create(entity);
  }

  async list(projectId: string) {
    return this.repo.findByProject(projectId);
  }

  async get(id: string) {
    const connector = await this.repo.findById(id);
    if (!connector) throw new NotFoundException('Custom connector not found');
    return connector;
  }

  async update(id: string, input: Partial<CustomConnectorEntity>) {
    return this.repo.update(id, input as any);
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }

  async addEndpoint(connectorId: string, input: {
    name: string;
    description?: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    requestHeaders?: Record<string, string>;
    requestBody?: Record<string, unknown>;
  }) {
    const connector = await this.repo.findById(connectorId);
    if (!connector) throw new NotFoundException('Custom connector not found');

    const endpoint = EndpointEntity.create(input);
    const endpoints = [...connector.endpoints, endpoint];
    await this.repo.update(connectorId, { endpoints } as any);
    return endpoint;
  }

  async addResponseMapping(connectorId: string, input: {
    fieldName: string;
    jsonPath: string;
    fieldType: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    defaultValue?: unknown;
  }) {
    const connector = await this.repo.findById(connectorId);
    if (!connector) throw new NotFoundException('Custom connector not found');

    const mapping = ResponseMappingEntity.create(input);
    const responseMappings = [...connector.responseMappings, mapping];
    await this.repo.update(connectorId, { responseMappings } as any);
    return mapping;
  }

  async generateManifest(connectorId: string) {
    const connector = await this.repo.findById(connectorId);
    if (!connector) throw new NotFoundException('Custom connector not found');

    return {
      id: `custom-${connector.id}`,
      name: connector.name,
      version: '1.0.0',
      description: connector.description,
      category: 'custom',
      auth: connector.authConfig,
      actions: connector.endpoints.map(ep => ({
        id: ep.id,
        name: ep.name,
        description: ep.description,
        method: ep.method,
        path: ep.path,
        input: [],
        output: connector.responseMappings
          .filter(m => true)
          .map(m => ({
            key: m.fieldName,
            label: m.fieldName,
            type: m.fieldType,
            description: m.description,
          })),
      })),
      triggers: [],
      webhooks: [],
      permissions: {
        permissions: [{ scope: 'network', actions: ['read', 'write'] }],
      },
      author: 'custom',
    };
  }
}
