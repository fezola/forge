export type ConnectorType = 'rest' | 'graphql' | 'webhook' | 'websocket';

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface CreateConnectorInput {
  name: string;
  type: ConnectorType;
  config: Record<string, unknown>;
}

export interface ConnectorExecutionResult {
  success: boolean;
  statusCode: number;
  data: unknown;
  duration: number;
}

export * from './manifest.types';
export * from './action.types';
export * from './trigger.types';
export * from './webhook.types';
export * from './permission.types';
export * from './secret.types';
export * from './marketplace.types';
export * from './errors.types';
