import type { ActionOutputField } from './action.interface';

export interface ConnectorWebhook {
  id: string;
  name: string;
  description: string;
  event: string;
  path: string;
  headers?: Record<string, string>;
  secretHeader?: string;
  output: ActionOutputField[];
}