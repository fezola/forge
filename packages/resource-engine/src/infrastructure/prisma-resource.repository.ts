import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { ResourceBase, CreateResourceInput, UpdateResourceInput, ResourceListResult, ResourceFilter, ResourceLifecycleState } from '@forge/resource-types';
import type { IResourceRepository } from '../domain/resource-interfaces';

function toResource(row: any): ResourceBase {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    description: row.description ?? undefined,
    slug: row.slug,
    ownerId: row.ownerId,
    organizationId: row.organizationId ?? undefined,
    projectId: row.projectId ?? undefined,
    lifecycleState: row.lifecycleState as ResourceLifecycleState,
    visibility: row.visibility as any,
    version: row.version,
    tags: row.tags ?? [],
    metadata: row.metadata ?? {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt?.toISOString() ?? undefined,
    deletedAt: row.deletedAt?.toISOString() ?? undefined,
  };
}

@Injectable()
export class PrismaResourceRepository implements IResourceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateResourceInput & { id: string; type: string; slug: string; createdBy: string; lifecycleState: ResourceLifecycleState; version: number }): Promise<ResourceBase> {
    const row = await this.prisma.forgeResource.create({
      data: {
        id: input.id,
        type: input.type,
        name: input.name,
        slug: input.slug,
        ownerId: input.ownerId,
        organizationId: input.organizationId,
        projectId: input.projectId,
        lifecycleState: input.lifecycleState,
        visibility: input.visibility ?? 'private',
        version: input.version,
        tags: input.tags ?? [],
        metadata: input.metadata as any,
        createdBy: input.createdBy,
        updatedBy: input.createdBy,
      },
    });
    return toResource(row);
  }

  async update(id: string, input: UpdateResourceInput & { updatedBy: string }): Promise<ResourceBase> {
    const row = await this.prisma.forgeResource.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        visibility: input.visibility,
        tags: input.tags,
        metadata: input.metadata as any,
        updatedBy: input.updatedBy,
      },
    });
    return toResource(row);
  }

  async updateLifecycle(id: string, state: ResourceLifecycleState, updatedBy: string): Promise<ResourceBase> {
    const row = await this.prisma.forgeResource.update({
      where: { id },
      data: {
        lifecycleState: state,
        updatedBy,
        ...(state === 'archived' ? { archivedAt: new Date() } : {}),
        ...(state === 'deleted' ? { deletedAt: new Date() } : {}),
        ...(state === 'active' && { archivedAt: null, deletedAt: null }),
      },
    });
    return toResource(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.forgeResource.delete({ where: { id } });
  }

  async findById(id: string): Promise<ResourceBase | null> {
    const row = await this.prisma.forgeResource.findUnique({ where: { id } });
    return row ? toResource(row) : null;
  }

  async findBySlug(type: string, slug: string, projectId?: string): Promise<ResourceBase | null> {
    const where: any = { type, slug };
    if (projectId) where.projectId = projectId;
    const row = await this.prisma.forgeResource.findFirst({ where });
    return row ? toResource(row) : null;
  }

  async find(filter: ResourceFilter): Promise<ResourceListResult> {
    const where: any = { deletedAt: null };
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.organizationId) where.organizationId = filter.organizationId;
    if (filter.ownerId) where.ownerId = filter.ownerId;
    if (filter.type) where.type = filter.type;
    if (filter.lifecycleState) where.lifecycleState = filter.lifecycleState;
    if (filter.visibility) where.visibility = filter.visibility;
    if (filter.tags && filter.tags.length > 0) where.tags = { hasSome: filter.tags };
    if (filter.searchQuery) where.name = { contains: filter.searchQuery, mode: 'insensitive' };
    if (filter.createdAfter) where.createdAt = { ...where.createdAt, gte: new Date(filter.createdAfter) };
    if (filter.createdBefore) where.createdAt = { ...where.createdAt, lte: new Date(filter.createdBefore) };

    const orderBy: any = {};
    if (filter.sortBy) orderBy[filter.sortBy] = filter.sortDirection || 'desc';
    else orderBy.createdAt = 'desc';

    const [items, total] = await Promise.all([
      this.prisma.forgeResource.findMany({
        where,
        skip: filter.offset ?? 0,
        take: filter.limit ?? 50,
        orderBy,
      }),
      this.prisma.forgeResource.count({ where }),
    ]);
    return { items: items.map(toResource), total, offset: filter.offset ?? 0, limit: filter.limit ?? 50 };
  }

  async getPermissions(id: string): Promise<any[]> {
    return this.prisma.resourcePermission.findMany({ where: { resourceId: id } });
  }
}