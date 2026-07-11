import type {
  ResourceBase, CreateResourceInput, UpdateResourceInput, ResourceListResult, ResourceFilter,
  ResourceTypeDefinition, ResourceLifecycleState,
  ResourcePermission, ResourceRelationship, CreateRelationshipInput, ResourceGraph,
  ResourceVersion, CreateResourceVersionInput,
  ResourceMetadata, MetadataFilter,
  ResourceComment, CreateCommentInput, UpdateCommentInput,
  ActivityEntry, ActivityFeedFilter,
  AuditEntry, AuditFilter,
  ResourceHealth, HealthCheckResult,
  ResourceSearchQuery, ResourceSearchResult, SearchIndexEntry,
  ResourceEvent, ResourceEventType,
} from '@forge/resource-types';

// ---- Repository ----
export interface IResourceRepository {
  create(input: CreateResourceInput & { id: string; type: string; slug: string; createdBy: string; lifecycleState: ResourceLifecycleState; version: number }): Promise<ResourceBase>;
  update(id: string, input: UpdateResourceInput & { updatedBy: string }): Promise<ResourceBase>;
  updateLifecycle(id: string, state: ResourceLifecycleState, updatedBy: string): Promise<ResourceBase>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ResourceBase | null>;
  findBySlug(type: string, slug: string, projectId?: string): Promise<ResourceBase | null>;
  find(filter: ResourceFilter): Promise<ResourceListResult>;
  getPermissions(id: string): Promise<ResourcePermission[]>;
}

export interface IResourceTypeRepository {
  register(type: ResourceTypeDefinition): void;
  get(type: string): ResourceTypeDefinition | undefined;
  getAll(): ResourceTypeDefinition[];
}

// ---- Version Repository ----
export interface IVersionRepository {
  create(input: CreateResourceVersionInput): Promise<ResourceVersion>;
  list(resourceId: string): Promise<ResourceVersion[]>;
  getById(id: string): Promise<ResourceVersion | null>;
  getLatest(resourceId: string): Promise<ResourceVersion | null>;
  delete(id: string): Promise<void>;
}

// ---- Permission Repository ----
export interface IPermissionRepository {
  save(permission: ResourcePermission): Promise<void>;
  delete(id: string): Promise<void>;
  findByResource(resourceId: string): Promise<ResourcePermission[]>;
  findByIdentity(identityId: string, resourceId: string): Promise<ResourcePermission[]>;
}

// ---- Relationship Repository ----
export interface IRelationshipRepository {
  create(input: CreateRelationshipInput & { id: string; createdBy: string }): Promise<ResourceRelationship>;
  delete(id: string): Promise<void>;
  findByResource(resourceId: string): Promise<ResourceRelationship[]>;
  findGraph(resourceId: string, depth?: number): Promise<ResourceGraph>;
  hasRelationship(sourceId: string, targetId: string): Promise<boolean>;
}

// ---- Metadata Repository ----
export interface IMetadataRepository {
  set(resourceId: string, key: string, value: unknown, createdBy: string): Promise<void>;
  delete(resourceId: string, key: string): Promise<void>;
  get(resourceId: string, key?: string): Promise<ResourceMetadata[]>;
  findByFilter(filters: MetadataFilter[]): Promise<string[]>;
}

// ---- Comment Repository ----
export interface ICommentRepository {
  create(input: CreateCommentInput): Promise<ResourceComment>;
  update(id: string, input: UpdateCommentInput): Promise<ResourceComment>;
  delete(id: string): Promise<void>;
  resolve(id: string, resolvedBy: string): Promise<void>;
  findByResource(resourceId: string): Promise<ResourceComment[]>;
  findById(id: string): Promise<ResourceComment | null>;
}

// ---- Audit Repository ----
export interface IAuditRepository {
  log(entry: AuditEntry): Promise<void>;
  list(filter: AuditFilter): Promise<AuditEntry[]>;
}

// ---- Activity Repository ----
export interface IActivityRepository {
  log(entry: ActivityEntry): Promise<void>;
  list(filter: ActivityFeedFilter): Promise<ActivityEntry[]>;
  listByProject(projectId: string, offset?: number, limit?: number): Promise<ActivityEntry[]>;
}

// ---- Favorite Repository ----
export interface IFavoriteRepository {
  add(resourceId: string, identityId: string, label?: string): Promise<void>;
  remove(resourceId: string, identityId: string): Promise<void>;
  list(identityId: string): Promise<{ resource: ResourceBase; favorite: { createdAt: string; label?: string } }[]>;
  isFavorited(resourceId: string, identityId: string): Promise<boolean>;
}

// ---- Health Repository ----
export interface IHealthRepository {
  record(check: HealthCheckResult): Promise<void>;
  getLatest(resourceId: string): Promise<ResourceHealth | null>;
  listByType(resourceType: string): Promise<ResourceHealth[]>;
}

// ---- Search Index Repository ----
export interface ISearchIndexRepository {
  index(entry: SearchIndexEntry): Promise<void>;
  remove(resourceId: string): Promise<void>;
  search(query: ResourceSearchQuery): Promise<ResourceSearchResult>;
  reindex(resourceType?: string): Promise<void>;
}

// ---- Events ----
export interface IResourceEventPort {
  emit(event: ResourceEvent): Promise<void>;
  subscribe(type: ResourceEventType, handler: (event: ResourceEvent) => void): void;
  unsubscribe(type: ResourceEventType, handler: (event: ResourceEvent) => void): void;
  isAvailable(): boolean;
}

// ---- Workflow Bridge ----
export interface IResourceWorkflowPort {
  emitWorkflowEvent(event: ResourceEvent): Promise<void>;
  isAvailable(): boolean;
}