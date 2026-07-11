export interface RbacRole {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  permissions?: RbacPermission[];
  members?: RbacRoleMember[];
}

export interface RbacPermission {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown> | null;
  effect: 'allow' | 'deny';
  createdAt: string;
}

export interface RbacRoleMember {
  id: string;
  roleId: string;
  identityId: string;
  projectId?: string | null;
  grantedBy?: string | null;
  grantedAt: string;
  expiresAt?: string | null;
}

export type PermissionEffect = 'allow' | 'deny';
