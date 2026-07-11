import { ActionFieldDefinition } from './action.types';

export interface WebhookDefinition {
  id: string;
  connectorId: string;
  name: string;
  description: string;
  event: string;
  path: string;
  headers?: Record<string, string>;
  secretHeader?: string;
  output: ActionFieldDefinition[];
}

export interface WebhookEvent {
  event: string;
  connectorId: string;
  projectId: string;
  payload: unknown;
  receivedAt: string;
}
