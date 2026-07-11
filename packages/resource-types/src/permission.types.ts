export type ResourcePermissionAction = 'read' | 'write' | 'delete' | 'share' | 'execute' | 'publish' | 'admin';

export type ResourcePermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer' | 'custom';

export interface ResourcePermission {
  id: string;
  resourceId: string;
  identityId?: string;
  organizationId?: string;
  roleId?: string;
  permissionLevel: ResourcePermissionLevel;
  grantedActions: ResourcePermissionAction[];
  grantedBy: string;
  createdAt: string;
  expiresAt?: string;
}

export interface GrantResourcePermissionInput {
  resourceId: string;
  identityId?: string;
  organizationId?: string;
  roleId?: string;
  permissionLevel: ResourcePermissionLevel;
  customActions?: ResourcePermissionAction[];
  expiresAt?: string;
}

export interface ResourceAccessCheckInput {
  identityId: string;
  resourceId: string;
  action: ResourcePermissionAction;
}

export interface ResourceAccessCheckResult {
  granted: boolean;
  permissionLevel?: ResourcePermissionLevel;
  reason?: string;
}