import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  ResourceBase, CreateResourceInput, UpdateResourceInput, ResourceListResult, ResourceFilter,
  ResourceTypeDefinition, ResourceLifecycleState, LifecycleTransition,
  ResourcePermission, GrantResourcePermissionInput, ResourceAccessCheckInput, ResourceAccessCheckResult,
  ResourceRelationship, CreateRelationshipInput, ResourceGraph,
  ResourceVersion,
  ResourceMetadata, MetadataFilter,
  ResourceComment, CreateCommentInput, UpdateCommentInput,
  ActivityEntry, ActivityFeedFilter,
  AuditEntry, AuditFilter, AuditAction,
  ResourceHealth, HealthCheckResult,
  ResourceSearchQuery, ResourceSearchResult,
  ResourceEvent, ResourceEventType,
  DEFAULT_LIFECYCLE_TRANSITIONS,
} from '@forge/resource-types';
import { ResourceError } from '@forge/resource-types';
import type {
  IResourceRepository, IResourceTypeRepository, IVersionRepository,
  IPermissionRepository, IRelationshipRepository, IMetadataRepository,
  ICommentRepository, IAuditRepository, IActivityRepository,
  IFavoriteRepository, IHealthRepository, ISearchIndexRepository,
  IResourceEventPort, IResourceWorkflowPort,
} from '../domain/resource-interfaces';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);
  private readonly defaultTransitions = DEFAULT_LIFECYCLE_TRANSITIONS;

  constructor(
    @Inject('IResourceRepository')
    private readonly resourceRepo: IResourceRepository,
    @Inject('IResourceTypeRepository')
    private readonly typeRepo: IResourceTypeRepository,
    @Inject('IVersionRepository')
    private readonly versionRepo: IVersionRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepo: IPermissionRepository,
    @Inject('IRelationshipRepository')
    private readonly relationshipRepo: IRelationshipRepository,
    @Inject('IMetadataRepository')
    private readonly metadataRepo: IMetadataRepository,
    @Inject('ICommentRepository')
    private readonly commentRepo: ICommentRepository,
    @Inject('IAuditRepository')
    private readonly auditRepo: IAuditRepository,
    @Inject('IActivityRepository')
    private readonly activityRepo: IActivityRepository,
    @Inject('IFavoriteRepository')
    private readonly favoriteRepo: IFavoriteRepository,
    @Inject('IHealthRepository')
    private readonly healthRepo: IHealthRepository,
    @Inject('ISearchIndexRepository')
    private readonly searchRepo: ISearchIndexRepository,
    @Inject('IResourceEventPort')
    private readonly eventEmitter: IResourceEventPort,
    @Inject('IResourceWorkflowPort')
    private readonly workflowBridge: IResourceWorkflowPort,
  ) {}

  // ---- Resource Type Registry ----

  registerType(def: ResourceTypeDefinition): void {
    const existing = this.typeRepo.get(def.type);
    if (existing) throw new ResourceError('RESOURCE_TYPE_ALREADY_REGISTERED', `Resource type '${def.type}' already registered`, 409);
    this.typeRepo.register(def);
  }

  getType(type: string): ResourceTypeDefinition {
    const def = this.typeRepo.get(type);
    if (!def) throw new ResourceError('RESOURCE_TYPE_NOT_FOUND', `Resource type '${type}' not found`, 404);
    return def;
  }

  listTypes(): ResourceTypeDefinition[] {
    return this.typeRepo.getAll();
  }

  // ---- CRUD ----

  async create(input: CreateResourceInput, createdBy: string): Promise<ResourceBase> {
    const typeDef = this.getType(input.name);
    const id = uuid();
    const slug = input.slug || this.toSlug(input.name);

    const existing = await this.resourceRepo.findBySlug(typeDef.type, slug, input.projectId);
    if (existing) throw new ResourceError('RESOURCE_ALREADY_EXISTS', `Resource '${input.name}' already exists`, 409);

    const resource = await this.resourceRepo.create({
      ...input,
      id,
      slug,
      createdBy,
      type: typeDef.type,
      lifecycleState: input.lifecycleState || 'creating',
      version: 1,
    });

    await this.searchRepo.index(this.toSearchEntry(resource));
    await this.logAudit(resource.id, typeDef.type, 'resource.created', createdBy, input.projectId, input.organizationId);
    await this.logActivity(resource.id, typeDef.type, resource.name, createdBy, 'Created', input.projectId);
    await this.emitEvent('resource.created', resource, createdBy);

    return resource;
  }

  async update(id: string, input: UpdateResourceInput, updatedBy: string): Promise<ResourceBase> {
    const existing = await this.findOrThrow(id);
    const updated = await this.resourceRepo.update(id, { ...input, updatedBy });

    await this.versionResource(existing, updatedBy);
    await this.searchRepo.index(this.toSearchEntry(updated));
    await this.logAudit(id, existing.type, 'resource.updated', updatedBy, existing.projectId, existing.organizationId);
    await this.logActivity(id, existing.type, existing.name, updatedBy, 'Updated', existing.projectId);
    await this.emitEvent('resource.updated', updated, updatedBy, this.extractChanges(existing, input as unknown as Record<string, unknown>));

    return updated;
  }

  async findById(id: string): Promise<ResourceBase> {
    return this.findOrThrow(id);
  }

  async find(filter: ResourceFilter): Promise<ResourceListResult> {
    return this.resourceRepo.find(filter);
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const resource = await this.findOrThrow(id);
    await this.resourceRepo.delete(id);
    await this.searchRepo.remove(id);
    await this.logAudit(id, resource.type, 'resource.deleted', deletedBy, resource.projectId, resource.organizationId);
    await this.logActivity(id, resource.type, resource.name, deletedBy, 'Deleted', resource.projectId);
    await this.emitEvent('resource.deleted', resource, deletedBy);
  }

  // ---- Lifecycle ----

  async transitionLifecycle(id: string, targetState: ResourceLifecycleState, actorId: string): Promise<ResourceBase> {
    const resource = await this.findOrThrow(id);
    const transition = this.defaultTransitions.find(
      (t: LifecycleTransition) => t.from === resource.lifecycleState && t.to === targetState,
    );
    if (!transition) {
      throw new ResourceError('INVALID_LIFECYCLE_TRANSITION',
        `Cannot transition from '${resource.lifecycleState}' to '${targetState}'`, 400);
    }

    const oldState = resource.lifecycleState;
    const updated = await this.resourceRepo.updateLifecycle(id, targetState, actorId);

    await this.logAudit(id, resource.type, 'resource.lifecycle_changed', actorId, resource.projectId, resource.organizationId,
      { lifecycleState: { from: oldState, to: targetState } });
    await this.logActivity(id, resource.type, resource.name, actorId, `Lifecycle changed to ${targetState}`, resource.projectId);
    await this.emitEvent('resource.lifecycle_changed', updated, actorId, {
      lifecycleState: { from: oldState, to: targetState },
    });

    return updated;
  }

  // ---- Versioning ----

  async listVersions(resourceId: string): Promise<ResourceVersion[]> {
    return this.versionRepo.list(resourceId);
  }

  async restoreVersion(resourceId: string, versionId: string, actorId: string): Promise<ResourceBase> {
    const version = await this.versionRepo.getById(versionId);
    if (!version) throw new ResourceError('VERSION_NOT_FOUND', 'Version not found', 404);
    if (version.resourceId !== resourceId) throw new ResourceError('VERSION_NOT_FOUND', 'Version does not belong to this resource', 404);

    const versionData = version.data as unknown as UpdateResourceInput;
    const updated = await this.resourceRepo.update(resourceId, { ...versionData, updatedBy: actorId } as UpdateResourceInput & { updatedBy: string });
    await this.logAudit(resourceId, updated.type, 'resource.version_restored', actorId, updated.projectId, updated.organizationId);
    await this.emitEvent('resource.version_restored', { ...updated, version: version.versionNumber }, actorId);
    return updated;
  }

  // ---- Tags ----

  async updateTags(id: string, tags: string[], updatedBy: string): Promise<ResourceBase> {
    if (tags.length > 50) throw new ResourceError('TAG_LIMIT_EXCEEDED', 'Maximum 50 tags per resource', 400);
    return this.update(id, { tags } as UpdateResourceInput, updatedBy);
  }

  // ---- Metadata ----

  async setMetadata(resourceId: string, key: string, value: unknown, createdBy: string): Promise<void> {
    await this.findOrThrow(resourceId);
    await this.metadataRepo.set(resourceId, key, value, createdBy);
  }

  async deleteMetadata(resourceId: string, key: string): Promise<void> {
    await this.findOrThrow(resourceId);
    await this.metadataRepo.delete(resourceId, key);
  }

  async getMetadata(resourceId: string, key?: string): Promise<ResourceMetadata[]> {
    await this.findOrThrow(resourceId);
    return this.metadataRepo.get(resourceId, key);
  }

  async findByMetadata(filters: MetadataFilter[]): Promise<string[]> {
    return this.metadataRepo.findByFilter(filters);
  }

  // ---- Permissions ----

  async grantPermission(input: GrantResourcePermissionInput, grantedBy: string): Promise<ResourcePermission> {
    await this.findOrThrow(input.resourceId);
    const permission: ResourcePermission = {
      id: uuid(),
      resourceId: input.resourceId,
      identityId: input.identityId,
      organizationId: input.organizationId,
      roleId: input.roleId,
      permissionLevel: input.permissionLevel,
      grantedActions: input.customActions || [],
      grantedBy,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
    };
    await this.permissionRepo.save(permission);
    await this.logAudit(input.resourceId, '', 'resource.permission_granted', grantedBy);
    await this.emitEvent('resource.permission_changed', { id: input.resourceId } as ResourceBase, grantedBy);
    return permission;
  }

  async revokePermission(permissionId: string, revokedBy: string): Promise<void> {
    await this.permissionRepo.delete(permissionId);
    await this.logAudit('', '', 'resource.permission_revoked', revokedBy);
  }

  async checkAccess(input: ResourceAccessCheckInput): Promise<ResourceAccessCheckResult> {
    const permissions = await this.permissionRepo.findByIdentity(input.identityId, input.resourceId);
    for (const p of permissions) {
      if (p.grantedActions.includes(input.action)) {
        return { granted: true, permissionLevel: p.permissionLevel };
      }
    }
    return { granted: false, reason: `Action '${input.action}' not permitted` };
  }

  async listPermissions(resourceId: string): Promise<ResourcePermission[]> {
    return this.permissionRepo.findByResource(resourceId);
  }

  // ---- Relationships ----

  async createRelationship(input: CreateRelationshipInput, createdBy: string): Promise<ResourceRelationship> {
    await Promise.all([this.findOrThrow(input.sourceResourceId), this.findOrThrow(input.targetResourceId)]);

    const exists = await this.relationshipRepo.hasRelationship(input.sourceResourceId, input.targetResourceId);
    if (exists) throw new ResourceError('RELATIONSHIP_ALREADY_EXISTS', 'Relationship already exists', 409);

    const rel = await this.relationshipRepo.create({ ...input, id: uuid(), createdBy });
    await this.logAudit(input.sourceResourceId, '', 'resource.relationship_created', createdBy);
    await this.emitEvent('resource.relationship_added', { id: input.sourceResourceId } as ResourceBase, createdBy);
    return rel;
  }

  async deleteRelationship(id: string, deletedBy: string): Promise<void> {
    await this.relationshipRepo.delete(id);
    await this.logAudit('', '', 'resource.relationship_deleted', deletedBy);
  }

  async getRelationships(resourceId: string): Promise<ResourceRelationship[]> {
    return this.relationshipRepo.findByResource(resourceId);
  }

  async getResourceGraph(resourceId: string, depth?: number): Promise<ResourceGraph> {
    return this.relationshipRepo.findGraph(resourceId, depth);
  }

  // ---- Comments ----

  async addComment(input: CreateCommentInput): Promise<ResourceComment> {
    await this.findOrThrow(input.resourceId);
    const comment = await this.commentRepo.create(input);
    await this.logAudit(input.resourceId, '', 'resource.comment_added', input.authorId);
    await this.emitEvent('resource.comment_added', { id: input.resourceId } as ResourceBase, input.authorId);
    return comment;
  }

  async updateComment(id: string, input: UpdateCommentInput): Promise<ResourceComment> {
    return this.commentRepo.update(id, input);
  }

  async resolveComment(id: string, resolvedBy: string): Promise<void> {
    await this.commentRepo.resolve(id, resolvedBy);
  }

  async deleteComment(id: string): Promise<void> {
    await this.commentRepo.delete(id);
  }

  async listComments(resourceId: string): Promise<ResourceComment[]> {
    return this.commentRepo.findByResource(resourceId);
  }

  // ---- Favorites ----

  async addFavorite(resourceId: string, identityId: string, label?: string): Promise<void> {
    await this.findOrThrow(resourceId);
    await this.favoriteRepo.add(resourceId, identityId, label);
    await this.emitEvent('resource.favorited', { id: resourceId } as ResourceBase, identityId);
  }

  async removeFavorite(resourceId: string, identityId: string): Promise<void> {
    await this.favoriteRepo.remove(resourceId, identityId);
    await this.emitEvent('resource.unfavorited', { id: resourceId } as ResourceBase, identityId);
  }

  async listFavorites(identityId: string): Promise<{ resource: ResourceBase; favorite: { createdAt: string; label?: string } }[]> {
    return this.favoriteRepo.list(identityId);
  }

  async isFavorited(resourceId: string, identityId: string): Promise<boolean> {
    return this.favoriteRepo.isFavorited(resourceId, identityId);
  }

  // ---- Health ----

  async recordHealth(check: HealthCheckResult): Promise<void> {
    await this.healthRepo.record(check);
    await this.emitEvent('resource.health_changed', { id: check.resourceId } as ResourceBase, 'system');
  }

  async getHealth(resourceId: string): Promise<ResourceHealth | null> {
    return this.healthRepo.getLatest(resourceId);
  }

  // ---- Activity Feed ----

  async getActivityFeed(filter: ActivityFeedFilter): Promise<ActivityEntry[]> {
    return this.activityRepo.list(filter);
  }

  async getProjectActivity(projectId: string, offset?: number, limit?: number): Promise<ActivityEntry[]> {
    return this.activityRepo.listByProject(projectId, offset, limit);
  }

  // ---- Audit ----

  async getAuditLog(filter: AuditFilter): Promise<AuditEntry[]> {
    return this.auditRepo.list(filter);
  }

  // ---- Search ----

  async search(query: ResourceSearchQuery): Promise<ResourceSearchResult> {
    return this.searchRepo.search(query);
  }

  async reindexSearchIndex(resourceType?: string): Promise<void> {
    await this.searchRepo.reindex(resourceType);
  }

  // ---- Health Check ----

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // ---- Private Helpers ----

  private async findOrThrow(id: string): Promise<ResourceBase> {
    const resource = await this.resourceRepo.findById(id);
    if (!resource) throw new ResourceError('RESOURCE_NOT_FOUND', 'Resource not found', 404);
    return resource;
  }

  private async versionResource(existing: ResourceBase, updatedBy: string): Promise<void> {
    if (existing.version > 0) {
      const prevVersion = await this.versionRepo.getLatest(existing.id);
      if (!prevVersion || JSON.stringify(prevVersion.data) !== JSON.stringify(existing)) {
        await this.versionRepo.create({
          resourceId: existing.id,
          data: existing as unknown as Record<string, unknown>,
          createdBy: updatedBy,
        });
      }
    }
  }

  private async logAudit(
    resourceId: string, resourceType: string, action: AuditAction, actorId: string,
    projectId?: string, organizationId?: string, changes?: Record<string, { from: unknown; to: unknown }>,
  ): Promise<void> {
    try {
      await this.auditRepo.log({
        id: uuid(),
        resourceId,
        resourceType,
        action,
        actorId,
        projectId,
        organizationId,
        changes,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.warn(`Audit log write failed: ${(err as Error).message}`);
    }
  }

  private async logActivity(
    resourceId: string, resourceType: string, resourceName: string, actorId: string,
    action: string, projectId?: string,
  ): Promise<void> {
    try {
      await this.activityRepo.log({
        id: uuid(),
        resourceId,
        resourceType,
        resourceName,
        projectId,
        actorId,
        actorName: actorId,
        action,
        description: `${action} ${resourceType} '${resourceName}'`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.warn(`Activity log write failed: ${(err as Error).message}`);
    }
  }

  private async emitEvent(type: ResourceEventType, resource: ResourceBase, actorId: string, changes?: Record<string, { from: unknown; to: unknown }>): Promise<void> {
    const event: ResourceEvent = {
      id: uuid(),
      type,
      resourceId: resource.id,
      resourceType: resource.type,
      projectId: (resource as any).projectId,
      organizationId: (resource as any).organizationId,
      actorId,
      timestamp: new Date().toISOString(),
      changes,
    };

    try {
      await this.eventEmitter.emit(event);
      if (this.workflowBridge.isAvailable()) {
        await this.workflowBridge.emitWorkflowEvent(event);
      }
    } catch (err) {
      this.logger.warn(`Event emit failed: ${(err as Error).message}`);
    }
  }

  private extractChanges(existing: ResourceBase, input: Record<string, unknown>): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && (existing as any)[key] !== value) {
        changes[key] = { from: (existing as any)[key], to: value };
      }
    }
    return changes;
  }

  private toSearchEntry(resource: ResourceBase): { resourceId: string; type: string; name: string; description?: string; tags: string[]; metadata: Record<string, unknown>; textContent: string; projectId?: string; organizationId?: string; ownerId?: string; lifecycleState: string; createdAt: string; updatedAt: string } {
    return {
      resourceId: resource.id,
      type: resource.type,
      name: resource.name,
      description: resource.description,
      tags: resource.tags,
      metadata: resource.metadata,
      textContent: `${resource.name} ${resource.description || ''} ${resource.tags.join(' ')}`,
      projectId: (resource as any).projectId,
      organizationId: (resource as any).organizationId,
      ownerId: resource.ownerId,
      lifecycleState: resource.lifecycleState,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}