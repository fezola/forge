import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { FeatureFlag, CreateFeatureFlagInput, UpdateFeatureFlagInput, FlagOverride } from '@forge/config-types';
import { IFeatureFlagRepository } from '../domain/feature-flag-repository.interface';

function toFlag(row: any): FeatureFlag {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    enabled: row.enabled,
    rolloutPercentage: row.rolloutPercentage ?? undefined,
    sticky: row.sticky,
    targetIdentities: row.targetIdentities ?? [],
    targetOrganizations: row.targetOrganizations ?? [],
    targetProjects: row.targetProjects ?? [],
    targetEnvironments: row.targetEnvironments ?? [],
    requiredPermissions: row.requiredPermissions ?? [],
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  };
}

function toOverride(row: any): FlagOverride {
  return {
    id: row.id,
    flagId: row.flagId,
    identityId: row.identityId ?? undefined,
    organizationId: row.organizationId ?? undefined,
    projectId: row.projectId ?? undefined,
    environmentId: row.environmentId ?? undefined,
    enabled: row.enabled,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy ?? undefined,
  };
}

@Injectable()
export class PrismaFeatureFlagRepository implements IFeatureFlagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateFeatureFlagInput & { id: string; createdBy: string }): Promise<FeatureFlag> {
    const row = await this.prisma.featureFlag.create({
      data: {
        id: input.id,
        key: input.key,
        name: input.name,
        description: input.description,
        enabled: input.enabled ?? false,
        rolloutPercentage: input.rolloutPercentage,
        sticky: input.sticky ?? false,
        targetIdentities: input.targetIdentities ?? [],
        targetOrganizations: input.targetOrganizations ?? [],
        targetProjects: input.targetProjects ?? [],
        targetEnvironments: input.targetEnvironments ?? [],
        requiredPermissions: input.requiredPermissions ?? [],
        metadata: input.metadata as any,
        createdBy: input.createdBy,
      },
    });
    return toFlag(row);
  }

  async update(id: string, input: UpdateFeatureFlagInput & { updatedBy: string }): Promise<FeatureFlag> {
    const row = await this.prisma.featureFlag.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.enabled !== undefined && { enabled: input.enabled }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.rolloutPercentage !== undefined && { rolloutPercentage: input.rolloutPercentage }),
        ...(input.sticky !== undefined && { sticky: input.sticky }),
        ...(input.targetIdentities !== undefined && { targetIdentities: input.targetIdentities }),
        ...(input.targetOrganizations !== undefined && { targetOrganizations: input.targetOrganizations }),
        ...(input.targetProjects !== undefined && { targetProjects: input.targetProjects }),
        ...(input.targetEnvironments !== undefined && { targetEnvironments: input.targetEnvironments }),
        ...(input.requiredPermissions !== undefined && { requiredPermissions: input.requiredPermissions }),
        ...(input.metadata !== undefined && { metadata: input.metadata as any }),
      },
    });
    return toFlag(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.featureFlag.delete({ where: { id } });
  }

  async findById(id: string): Promise<FeatureFlag | null> {
    const row = await this.prisma.featureFlag.findUnique({ where: { id } });
    return row ? toFlag(row) : null;
  }

  async findByKey(key: string, _projectId?: string): Promise<FeatureFlag | null> {
    const row = await this.prisma.featureFlag.findUnique({ where: { key } });
    return row ? toFlag(row) : null;
  }

  async findByProject(projectId: string): Promise<FeatureFlag[]> {
    const rows = await this.prisma.featureFlag.findMany({
      where: { targetProjects: { has: projectId } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toFlag);
  }

  async setOverride(input: FlagOverride): Promise<FlagOverride> {
    const row = await this.prisma.flagOverride.create({
      data: {
        flagId: input.flagId,
        identityId: input.identityId,
        organizationId: input.organizationId,
        projectId: input.projectId,
        environmentId: input.environmentId,
        enabled: input.enabled,
        createdBy: input.createdBy,
      },
    });
    return toOverride(row);
  }

  async removeOverride(flagId: string, identityId?: string, organizationId?: string, projectId?: string): Promise<void> {
    const where: any = { flagId };
    if (identityId) where.identityId = identityId;
    if (organizationId) where.organizationId = organizationId;
    if (projectId) where.projectId = projectId;
    await this.prisma.flagOverride.deleteMany({ where });
  }

  async getOverrides(flagId: string): Promise<FlagOverride[]> {
    const rows = await this.prisma.flagOverride.findMany({ where: { flagId } });
    return rows.map(toOverride);
  }

  async getEffectiveOverride(flagId: string, identityId?: string, organizationId?: string, projectId?: string, environmentId?: string): Promise<FlagOverride | null> {
    const where: any = { flagId };
    if (identityId) where.identityId = identityId;
    if (organizationId) where.organizationId = organizationId;
    if (projectId) where.projectId = projectId;
    if (environmentId) where.environmentId = environmentId;
    const row = await this.prisma.flagOverride.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return row ? toOverride(row) : null;
  }

  async listActive(): Promise<FeatureFlag[]> {
    const rows = await this.prisma.featureFlag.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toFlag);
  }
}