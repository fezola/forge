import { AuthConfig } from '@forge/connector-sdk';
import { EndpointEntity } from './endpoint.entity';
import { ResponseMappingEntity } from './response-mapping.entity';

export class CustomConnectorEntity {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly authConfig: AuthConfig,
    public readonly baseUrl: string,
    public readonly endpoints: EndpointEntity[],
    public readonly responseMappings: ResponseMappingEntity[],
    public readonly globalHeaders: Record<string, string>,
    public readonly enabled: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    projectId: string;
    name: string;
    description?: string;
    authConfig: AuthConfig;
    baseUrl: string;
    globalHeaders?: Record<string, string>;
  }): CustomConnectorEntity {
    return new CustomConnectorEntity(
      crypto.randomUUID(),
      input.projectId,
      input.name,
      input.description || '',
      input.authConfig,
      input.baseUrl.replace(/\/+$/, ''),
      [],
      [],
      input.globalHeaders || {},
      true,
      new Date(),
      new Date(),
    );
  }
}
