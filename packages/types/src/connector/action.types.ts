import { ConnectorCategory } from './manifest.types';

export interface ActionFieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json' | 'file';
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  description?: string;
}

export interface ActionDefinition {
  id: string;
  connectorId: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  input: ActionFieldDefinition[];
  output: ActionFieldDefinition[];
  responseMapping?: Record<string, string>;
}

export interface ExecuteActionRequest {
  projectId: string;
  connectorId: string;
  actionId: string;
  input: Record<string, unknown>;
}

export interface ExecuteActionResponse {
  success: boolean;
  data: unknown;
  duration: number;
  error?: string;
}
