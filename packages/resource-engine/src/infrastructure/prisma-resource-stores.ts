import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { ResourceVersion, CreateResourceVersionInput } from '@forge/resource-types';
import type {
  IVersionRepository, IPermissionRepository, IRelationshipRepository,
  IMetadataRepository, ICommentRepository, IAuditRepository,
  IActivityRepository, IFavoriteRepository, IHealthRepository, ISearchIndexRepository,
} from '../domain/resource-interfaces';
import type { ResourcePermission, ResourceRelationship, CreateRelationshipInput } from '@forge/resource-types';
import type { ResourceMetadata, MetadataFilter, ResourceComment, CreateCommentInput, UpdateCommentInput } from '@forge/resource-types';
import type { AuditEntry, AuditFilter } from '@forge/resource-types';
import type { ActivityEntry, ActivityFeedFilter } from '@forge/resource-types';
import type { ResourceHealth, HealthCheckResult } from '@forge/resource-types';
import type { ResourceSearchQuery, ResourceSearchResult, SearchIndexEntry } from '@forge/resource-types';
import type { RelationshipType, ResourceGraph, ResourceGraphEdge } from '@forge/resource-types';

// ---- Versions ----

@Injectable()
export class PrismaVersionRepository implements IVersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateResourceVersionInput): Promise<ResourceVersion> {
    const versions = await this.prisma.resourceVersion.findMany({
      where: { resourceId: input.resourceId },
      orderBy: { versionNumber: 'desc' },
      take: 1,
    });
    const nextNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;
    const row = await this.prisma.resourceVersion.create({
      data: {
        resourceId: input.resourceId,
        versionNumber: nextNumber,
        data: input.data as any,
        diff: input.diff as any,
        createdBy: input.createdBy,
        label: input.label,
      },
    });
    return this.toVersion(row);
  }

  async list(resourceId: string): Promise<ResourceVersion[]> {
    const rows = await this.prisma.resourceVersion.findMany({
      where: { resourceId },
      orderBy: { versionNumber: 'desc' },
    });
    return rows.map(this.toVersion);
  }

  async getById(id: string): Promise<ResourceVersion | null> {
    const row = await this.prisma.resourceVersion.findUnique({ where: { id } });
    return row ? this.toVersion(row) : null;
  }

  async getLatest(resourceId: string): Promise<ResourceVersion | null> {
    const row = await this.prisma.resourceVersion.findFirst({
      where: { resourceId },
      orderBy: { versionNumber: 'desc' },
    });
    return row ? this.toVersion(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.resourceVersion.delete({ where: { id } });
  }

  private toVersion(row: any): ResourceVersion {
    return {
      id: row.id,
      resourceId: row.resourceId,
      versionNumber: row.versionNumber,
      data: row.data as Record<string, unknown>,
      diff: row.diff as Record<string, { from: unknown; to: unknown }> | undefined,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      label: row.label ?? undefined,
    };
  }
}

// ---- Resource Permissions ----

@Injectable()
export class PrismaResourcePermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(permission: ResourcePermission): Promise<void> {
    await this.prisma.resourcePermission.create({ data: this.toRow(permission) });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.resourcePermission.delete({ where: { id } });
  }

  async findByResource(resourceId: string): Promise<ResourcePermission[]> {
    const rows = await this.prisma.resourcePermission.findMany({ where: { resourceId } });
    return rows.map(this.fromRow);
  }

  async findByIdentity(identityId: string, resourceId: string): Promise<ResourcePermission[]> {
    const rows = await this.prisma.resourcePermission.findMany({
      where: { resourceId, identityId },
    });
    return rows.map(this.fromRow);
  }

  private toRow(p: ResourcePermission): any {
    return {
      id: p.id,
      resourceId: p.resourceId,
      identityId: p.identityId,
      organizationId: p.organizationId,
      roleId: p.roleId,
      permissionLevel: p.permissionLevel,
      grantedActions: p.grantedActions,
      grantedBy: p.grantedBy,
      createdAt: new Date(p.createdAt),
      expiresAt: p.expiresAt ? new Date(p.expiresAt) : undefined,
    };
  }

  private fromRow(row: any): ResourcePermission {
    return {
      id: row.id,
      resourceId: row.resourceId,
      identityId: row.identityId ?? undefined,
      organizationId: row.organizationId ?? undefined,
      roleId: row.roleId ?? undefined,
      permissionLevel: row.permissionLevel,
      grantedActions: row.grantedActions ?? [],
      grantedBy: row.grantedBy,
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt?.toISOString() ?? undefined,
    };
  }
}

// ---- Relationships ----

@Injectable()
export class PrismaRelationshipRepository implements IRelationshipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateRelationshipInput & { id: string; createdBy: string }): Promise<ResourceRelationship> {
    const row = await this.prisma.resourceRelationship.create({
      data: {
        id: input.id,
        sourceResourceId: input.sourceResourceId,
        targetResourceId: input.targetResourceId,
        relationshipType: input.relationshipType,
        label: input.label,
        metadata: input.metadata as any,
        createdBy: input.createdBy,
      },
    });
    return this.fromRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.resourceRelationship.delete({ where: { id } });
  }

  async findByResource(resourceId: string): Promise<ResourceRelationship[]> {
    const rows = await this.prisma.resourceRelationship.findMany({
      where: {
        OR: [{ sourceResourceId: resourceId }, { targetResourceId: resourceId }],
      },
    });
    return rows.map(this.fromRow);
  }

  async findGraph(resourceId: string, depth?: number): Promise<ResourceGraph> {
    const maxDepth = depth ?? 2;
    const visited = new Set<string>();
    const nodes: Map<string, any> = new Map();
    const edges: ResourceGraphEdge[] = [];
    const queue = [{ id: resourceId, level: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id) || current.level > maxDepth) continue;
      visited.add(current.id);

      const resource = await this.prisma.forgeResource.findUnique({ where: { id: current.id } });
      if (resource) nodes.set(current.id, { resourceId: current.id, type: resource.type, name: resource.name, lifecycleState: resource.lifecycleState });

      const rels = await this.prisma.resourceRelationship.findMany({
        where: {
          OR: [{ sourceResourceId: current.id }, { targetResourceId: current.id }],
        },
      });

      for (const rel of rels) {
        edges.push({ sourceId: rel.sourceResourceId, targetId: rel.targetResourceId, relationshipType: rel.relationshipType as RelationshipType, label: rel.label ?? undefined });
        const otherId = rel.sourceResourceId === current.id ? rel.targetResourceId : rel.sourceResourceId;
        if (!visited.has(otherId)) queue.push({ id: otherId, level: current.level + 1 });
      }
    }

    return { nodes: Array.from(nodes.values()), edges };
  }

  async hasRelationship(sourceId: string, targetId: string): Promise<boolean> {
    const count = await this.prisma.resourceRelationship.count({
      where: { sourceResourceId: sourceId, targetResourceId: targetId },
    });
    return count > 0;
  }

  private fromRow(row: any): ResourceRelationship {
    return {
      id: row.id,
      sourceResourceId: row.sourceResourceId,
      targetResourceId: row.targetResourceId,
      relationshipType: row.relationshipType as any,
      label: row.label ?? undefined,
      metadata: row.metadata ?? undefined,
      createdAt: row.createdAt.toISOString(),
      createdBy: row.createdBy,
    };
  }
}

// ---- Metadata ----

@Injectable()
export class PrismaResourceMetadataRepository implements IMetadataRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async set(resourceId: string, key: string, value: unknown, createdBy: string): Promise<void> {
    await this.prisma.resourceMetadata.upsert({
      where: { resourceId_key: { resourceId, key } },
      create: { resourceId, key, value: value as any, type: typeof value, createdBy },
      update: { value: value as any, type: typeof value },
    });
  }

  async delete(resourceId: string, key: string): Promise<void> {
    await this.prisma.resourceMetadata.deleteMany({ where: { resourceId, key } });
  }

  async get(resourceId: string, key?: string): Promise<ResourceMetadata[]> {
    const where: any = { resourceId };
    if (key) where.key = key;
    const rows = await this.prisma.resourceMetadata.findMany({ where });
    return rows.map((r: any) => ({
      id: r.id,
      resourceId: r.resourceId,
      key: r.key,
      value: r.value,
      type: r.type as any,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      createdBy: r.createdBy,
    }));
  }

  async findByFilter(filters: MetadataFilter[]): Promise<string[]> {
    const conditions = filters.map(f => {
      switch (f.operator) {
        case 'eq': return { key: f.key, value: f.value as any };
        case 'exists': return { key: f.key };
        default: return { key: f.key };
      }
    });
    const rows = await Promise.all(conditions.map(c => this.prisma.resourceMetadata.findMany({ where: c })));
    const ids = new Set(rows.flat().map(r => r.resourceId));
    return Array.from(ids);
  }
}

// ---- Comments ----

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateCommentInput): Promise<ResourceComment> {
    const row = await this.prisma.resourceComment.create({
      data: {
        resourceId: input.resourceId,
        parentId: input.parentId,
        authorId: input.authorId,
        authorName: input.authorName,
        body: input.body,
      },
    });
    return this.fromRow(row);
  }

  async update(id: string, input: UpdateCommentInput): Promise<ResourceComment> {
    const row = await this.prisma.resourceComment.update({
      where: { id },
      data: { body: input.body, edited: true },
    });
    return this.fromRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.resourceComment.delete({ where: { id } });
  }

  async resolve(id: string, resolvedBy: string): Promise<void> {
    await this.prisma.resourceComment.update({
      where: { id },
      data: { resolved: true, resolvedBy, resolvedAt: new Date() },
    });
  }

  async findByResource(resourceId: string): Promise<ResourceComment[]> {
    const rows = await this.prisma.resourceComment.findMany({
      where: { resourceId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(this.fromRow);
  }

  async findById(id: string): Promise<ResourceComment | null> {
    const row = await this.prisma.resourceComment.findUnique({ where: { id } });
    return row ? this.fromRow(row) : null;
  }

  private fromRow(row: any): ResourceComment {
    return {
      id: row.id,
      resourceId: row.resourceId,
      parentId: row.parentId ?? undefined,
      authorId: row.authorId,
      authorName: row.authorName ?? undefined,
      body: row.body,
      resolved: row.resolved,
      resolvedBy: row.resolvedBy ?? undefined,
      resolvedAt: row.resolvedAt?.toISOString() ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      edited: row.edited,
    };
  }
}

// ---- Audit ----

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.auditEntry.create({
      data: {
        id: entry.id,
        resourceId: entry.resourceId,
        resourceType: entry.resourceType,
        action: entry.action,
        actorId: entry.actorId,
        actorName: entry.actorName,
        projectId: entry.projectId,
        organizationId: entry.organizationId,
        changes: entry.changes as any,
        timestamp: new Date(entry.timestamp),
      },
    });
  }

  async list(filter: AuditFilter): Promise<AuditEntry[]> {
    const where: any = {};
    if (filter.resourceId) where.resourceId = filter.resourceId;
    if (filter.resourceType) where.resourceType = filter.resourceType;
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.action) where.action = filter.action;
    if (filter.createdAfter) where.timestamp = { ...where.timestamp, gte: new Date(filter.createdAfter) };
    if (filter.createdBefore) where.timestamp = { ...where.timestamp, lte: new Date(filter.createdBefore) };

    const rows = await this.prisma.auditEntry.findMany({
      where,
      skip: filter.offset ?? 0,
      take: filter.limit ?? 50,
      orderBy: { timestamp: 'desc' },
    });
    return rows.map((r: any) => ({
      id: r.id,
      resourceId: r.resourceId,
      resourceType: r.resourceType,
      action: r.action as any,
      actorId: r.actorId,
      actorName: r.actorName ?? undefined,
      projectId: r.projectId ?? undefined,
      organizationId: r.organizationId ?? undefined,
      changes: r.changes as any,
      metadata: undefined,
      timestamp: r.timestamp.toISOString(),
      ip: undefined,
      userAgent: undefined,
    }));
  }
}

// ---- Activity ----

@Injectable()
export class PrismaActivityRepository implements IActivityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async log(entry: ActivityEntry): Promise<void> {
    await this.prisma.activityEntry.create({ data: entry as any });
  }

  async list(filter: ActivityFeedFilter): Promise<ActivityEntry[]> {
    const where: any = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.resourceId) where.resourceId = filter.resourceId;
    if (filter.resourceType) where.resourceType = filter.resourceType;
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.createdAfter) where.timestamp = { gte: new Date(filter.createdAfter) };

    const rows = await this.prisma.activityEntry.findMany({
      where,
      skip: filter.offset ?? 0,
      take: filter.limit ?? 50,
      orderBy: { timestamp: 'desc' },
    });
    return rows.map((r: any) => ({
      id: r.id,
      resourceId: r.resourceId,
      resourceType: r.resourceType,
      resourceName: r.resourceName,
      projectId: r.projectId ?? undefined,
      actorId: r.actorId,
      actorName: r.actorName,
      action: r.action,
      description: r.description,
      metadata: r.metadata ?? undefined,
      timestamp: r.timestamp.toISOString(),
    }));
  }

  async listByProject(projectId: string, offset = 0, limit = 50): Promise<ActivityEntry[]> {
    const rows = await this.prisma.activityEntry.findMany({
      where: { projectId },
      skip: offset,
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
    return rows.map((r: any) => ({
      id: r.id,
      resourceId: r.resourceId,
      resourceType: r.resourceType,
      resourceName: r.resourceName,
      projectId: r.projectId ?? undefined,
      actorId: r.actorId,
      actorName: r.actorName,
      action: r.action,
      description: r.description,
      metadata: r.metadata ?? undefined,
      timestamp: r.timestamp.toISOString(),
    }));
  }
}

// ---- Favorites ----

@Injectable()
export class PrismaFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async add(resourceId: string, identityId: string, label?: string): Promise<void> {
    await this.prisma.resourceFavorite.upsert({
      where: { resourceId_identityId: { resourceId, identityId } },
      create: { resourceId, identityId, label },
      update: { label },
    });
  }

  async remove(resourceId: string, identityId: string): Promise<void> {
    await this.prisma.resourceFavorite.deleteMany({ where: { resourceId, identityId } });
  }

  async list(identityId: string): Promise<{ resource: any; favorite: { createdAt: string; label?: string } }[]> {
    const rows = await this.prisma.resourceFavorite.findMany({
      where: { identityId },
      include: { resource: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r: any) => ({
      resource: {
        id: r.resource.id,
        type: r.resource.type,
        name: r.resource.name,
        description: r.resource.description ?? undefined,
        slug: r.resource.slug,
        ownerId: r.resource.ownerId,
        projectId: r.resource.projectId ?? undefined,
        lifecycleState: r.resource.lifecycleState,
        tags: r.resource.tags ?? [],
        createdAt: r.resource.createdAt.toISOString(),
        updatedAt: r.resource.updatedAt.toISOString(),
      },
      favorite: {
        createdAt: r.createdAt.toISOString(),
        label: r.label ?? undefined,
      },
    }));
  }

  async isFavorited(resourceId: string, identityId: string): Promise<boolean> {
    const count = await this.prisma.resourceFavorite.count({ where: { resourceId, identityId } });
    return count > 0;
  }
}

// ---- Health ----

@Injectable()
export class PrismaHealthRepository implements IHealthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async record(check: HealthCheckResult): Promise<void> {
    const existing = await this.prisma.resourceHealth.findFirst({ where: { resourceId: check.resourceId } });
    if (existing) {
      await this.prisma.resourceHealth.update({
        where: { id: existing.id },
        data: {
          status: check.status,
          lastCheckedAt: new Date(check.timestamp),
          ...(check.healthy ? { lastHealthyAt: new Date(check.timestamp) } : {}),
          checks: { deleteMany: {}, create: check.checks.map(c => ({ name: c.name, status: c.status, message: c.message, durationMs: c.durationMs, lastCheckedAt: new Date(c.lastCheckedAt) })) },
        },
      });
    } else {
      await this.prisma.resourceHealth.create({
        data: {
          resourceId: check.resourceId,
          resourceType: '',
          status: check.status,
          lastCheckedAt: new Date(check.timestamp),
          ...(check.healthy ? { lastHealthyAt: new Date(check.timestamp) } : {}),
          checks: { create: check.checks.map(c => ({ name: c.name, status: c.status, message: c.message, durationMs: c.durationMs, lastCheckedAt: new Date(c.lastCheckedAt) })) },
        },
      });
    }
  }

  async getLatest(resourceId: string): Promise<ResourceHealth | null> {
    const row = await this.prisma.resourceHealth.findFirst({
      where: { resourceId },
      include: { checks: true },
    });
    if (!row) return null;
    return {
      resourceId: row.resourceId,
      resourceType: row.resourceType,
      status: row.status as any,
      message: row.message ?? undefined,
      lastCheckedAt: row.lastCheckedAt.toISOString(),
      lastHealthyAt: row.lastHealthyAt?.toISOString() ?? undefined,
      uptimePercent: row.uptimePercent ?? undefined,
      metrics: row.metrics as any,
      checks: row.checks.map((c: any) => ({
        name: c.name,
        status: c.status as any,
        message: c.message ?? undefined,
        durationMs: c.durationMs ?? undefined,
        lastCheckedAt: c.lastCheckedAt.toISOString(),
      })),
    };
  }

  async listByType(resourceType: string): Promise<ResourceHealth[]> {
    const rows = await this.prisma.resourceHealth.findMany({
      where: { resourceType },
      include: { checks: true },
    });
    return rows.map((r: any) => ({
      resourceId: r.resourceId,
      resourceType: r.resourceType,
      status: r.status as any,
      message: r.message ?? undefined,
      lastCheckedAt: r.lastCheckedAt.toISOString(),
      lastHealthyAt: r.lastHealthyAt?.toISOString() ?? undefined,
      uptimePercent: r.uptimePercent ?? undefined,
      metrics: r.metrics as any,
      checks: r.checks.map((c: any) => ({
        name: c.name,
        status: c.status as any,
        message: c.message ?? undefined,
        durationMs: c.durationMs ?? undefined,
        lastCheckedAt: c.lastCheckedAt.toISOString(),
      })),
    }));
  }
}

// ---- Search Index ----

@Injectable()
export class PrismaSearchIndexRepository implements ISearchIndexRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async index(entry: SearchIndexEntry): Promise<void> {
    await this.prisma.searchIndex.upsert({
      where: { resourceId: entry.resourceId },
      create: entry as any,
      update: entry as any,
    });
  }

  async remove(resourceId: string): Promise<void> {
    await this.prisma.searchIndex.deleteMany({ where: { resourceId } });
  }

  async search(query: ResourceSearchQuery): Promise<ResourceSearchResult> {
    const start = Date.now();
    const where: any = {
      OR: [
        { name: { contains: query.query, mode: 'insensitive' as const } },
        { description: { contains: query.query, mode: 'insensitive' as const } },
        { textContent: { contains: query.query, mode: 'insensitive' as const } },
      ],
    };
    if (query.types && query.types.length > 0) where.type = { in: query.types };
    if (query.projectId) where.projectId = query.projectId;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.lifecycleStates && query.lifecycleStates.length > 0) where.lifecycleState = { in: query.lifecycleStates };
    if (query.tags && query.tags.length > 0) where.tags = { hasSome: query.tags };

    const [items, total] = await Promise.all([
      this.prisma.searchIndex.findMany({
        where,
        skip: query.offset ?? 0,
        take: query.limit ?? 50,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.searchIndex.count({ where }),
    ]);

    return {
      items: items.map((r: any) => ({
        resourceId: r.resourceId,
        type: r.type,
        name: r.name,
        description: r.description ?? undefined,
        slug: '',
        lifecycleState: r.lifecycleState,
        tags: r.tags ?? [],
        score: 1,
        matchedFields: ['name'],
        updatedAt: r.updatedAt.toISOString(),
      })),
      total,
      offset: query.offset ?? 0,
      limit: query.limit ?? 50,
      query: query.query,
      tookMs: Date.now() - start,
    };
  }

  async reindex(resourceType?: string): Promise<void> {
    const where: any = {};
    if (resourceType) where.type = resourceType;
    const resources = await this.prisma.forgeResource.findMany({ where });
    for (const r of resources) {
      await this.index({
        resourceId: r.id,
        type: r.type,
        name: r.name,
        description: r.description ?? undefined,
        tags: r.tags ?? [],
        metadata: (r.metadata ?? {}) as Record<string, unknown>,
        textContent: `${r.name} ${r.description || ''} ${r.tags.join(' ')}`,
        projectId: r.projectId ?? undefined,
        organizationId: r.organizationId ?? undefined,
        ownerId: r.ownerId,
        lifecycleState: r.lifecycleState,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      });
    }
  }
}