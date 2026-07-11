import type { PermissionSet } from './permission.types';

export interface ConnectorContext {
  requestId: string;
  projectId: string;
  environment: 'development' | 'production';
  secrets: Record<string, string>;
  actionId: string;
  input: Record<string, unknown>;
  permissions: PermissionSet;
}