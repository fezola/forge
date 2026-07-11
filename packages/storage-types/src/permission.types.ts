export type StoragePermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer';

export type StoragePermissionAction =
  | 'bucket:create'
  | 'bucket:read'
  | 'bucket:update'
  | 'bucket:delete'
  | 'bucket:list'
  | 'file:upload'
  | 'file:read'
  | 'file:update'
  | 'file:delete'
  | 'file:download'
  | 'file:share'
  | 'file:version:read'
  | 'file:version:restore'
  | 'folder:create'
  | 'folder:read'
  | 'folder:update'
  | 'folder:delete'
  | 'permission:manage'
  | 'signed_url:generate'
  | 'lifecycle:manage';

export interface StoragePermission {
  id: string;
  bucketId: string;
  identityId?: string;
  organizationId?: string;
  roleId?: string;
  permissionLevel: StoragePermissionLevel;
  grantedActions: StoragePermissionAction[];
  grantedBy: string;
  createdAt: string;
  expiresAt?: string;
}

export interface GrantPermissionInput {
  bucketId: string;
  identityId?: string;
  organizationId?: string;
  roleId?: string;
  permissionLevel: StoragePermissionLevel;
  customActions?: StoragePermissionAction[];
  expiresAt?: string;
}

export interface AccessCheckInput {
  identityId: string;
  bucketId: string;
  action: StoragePermissionAction;
  resourceId?: string;
  resourceType?: 'bucket' | 'file' | 'folder';
}

export interface AccessCheckResult {
  granted: boolean;
  permissionLevel?: StoragePermissionLevel;
  reason?: string;
}

export type ResourceAccessScope = 'public' | 'authenticated' | 'organization' | 'role' | 'identity' | 'custom';

export interface ResourceAccessRule {
  scope: ResourceAccessScope;
  identityIds?: string[];
  organizationIds?: string[];
  roleIds?: string[];
  permissionLevel?: StoragePermissionLevel;
}