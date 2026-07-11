import type { AuthConfig } from './auth.types';
import type { ConnectorAction } from './action.interface';
import type { ConnectorTrigger } from './trigger.interface';
import type { ConnectorWebhook } from './webhook.interface';
import type { PermissionSet } from './permission.types';
import type { ConnectorConfigComponent } from './config-component.types';

export type ConnectorCategory =
  | 'authentication'
  | 'payments'
  | 'blockchain'
  | 'ai'
  | 'email'
  | 'kyc'
  | 'storage'
  | 'messaging'
  | 'analytics'
  | 'custom';

export interface ConnectorManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: ConnectorCategory;
  icon?: string;
  auth: AuthConfig;
  actions: ConnectorAction[];
  triggers?: ConnectorTrigger[];
  webhooks?: ConnectorWebhook[];
  permissions: PermissionSet;
  configComponents?: ConnectorConfigComponent[];
  tags?: string[];
  homepage?: string;
  author: string;
}