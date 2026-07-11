export type ResourceLifecycleState = 'creating' | 'draft' | 'active' | 'archived' | 'deleted';

export type ResourceVisibility = 'private' | 'project' | 'organization' | 'public';

export interface ResourceBase {
  id: string;
  type: string;
  name: string;
  description?: string;
  slug: string;
  ownerId: string;
  organizationId?: string;
  projectId?: string;
  lifecycleState: ResourceLifecycleState;
  visibility: ResourceVisibility;
  version: number;
  tags: string[];
  metadata: Record<string, unknown>;
  permissions?: ResourcePermissions;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  archivedAt?: string;
  deletedAt?: string;
}

export interface CreateResourceInput {
  name: string;
  description?: string;
  slug?: string;
  ownerId: string;
  organizationId?: string;
  projectId?: string;
  visibility?: ResourceVisibility;
  lifecycleState?: ResourceLifecycleState;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateResourceInput {
  name?: string;
  description?: string;
  visibility?: ResourceVisibility;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ResourcePermissions {
  read: string[];
  write: string[];
  delete: string[];
  share: string[];
  execute: string[];
  publish: string[];
  admin: string[];
}

export interface ResourceListResult {
  items: ResourceBase[];
  total: number;
  offset: number;
  limit: number;
}

export interface ResourceFilter {
  projectId?: string;
  organizationId?: string;
  ownerId?: string;
  type?: string;
  lifecycleState?: ResourceLifecycleState;
  visibility?: ResourceVisibility;
  tags?: string[];
  searchQuery?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lifecycleState' | 'type';
  sortDirection?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}