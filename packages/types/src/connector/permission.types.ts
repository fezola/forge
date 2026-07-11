export type PermissionScope = 'network' | 'filesystem' | 'database' | 'environment';

export interface PermissionDTO {
  scope: PermissionScope;
  actions: ('read' | 'write' | 'delete')[];
  resources?: string[];
}

export interface PermissionSetDTO {
  permissions: PermissionDTO[];
}
