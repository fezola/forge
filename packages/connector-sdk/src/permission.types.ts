export type PermissionScope = 'network' | 'filesystem' | 'database' | 'environment';

export interface Permission {
  scope: PermissionScope;
  actions: ('read' | 'write' | 'delete')[];
  resources?: string[];
}

export interface PermissionSet {
  permissions: Permission[];
}