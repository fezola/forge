import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { Environment, CreateEnvironmentInput, UpdateEnvironmentInput, EnvironmentPromotionRequest, EnvironmentSnapshot } from '@forge/config-types';
import { IEnvironmentRepository } from '../domain/environment-repository.interface';

function toEnvironment(row: any): Environment {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    type: row.type,
    slug: row.slug,
    description: row.description ?? undefined,
    isDefault: row.isDefault,
    order: row.order,
    parentId: row.parentId ?? undefined,
    protected: row.protected,
    requiresApproval: row.requiresApproval,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  };
}

function toPromotionRequest(row: any): EnvironmentPromotionRequest {
  return {
    id: row.id,
    environmentId: row.environmentId,
    targetEnvironmentId: row.targetEnvironmentId,
    configIds: row.configIds ?? [],
    status: row.status,
    requestedBy: row.requestedBy,
    approvedBy: row.approvedBy ?? undefined,
    approvedAt: row.approvedAt?.toISOString() ?? undefined,
    promotedAt: row.promotedAt?.toISOString() ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function toSnapshot(row: any): EnvironmentSnapshot {
  return {
    id: row.id,
    environmentId: row.environmentId,
    label: row.label,
    configValues: row.configValues as Record<string, string>,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
  };
}

@Injectable()
export class PrismaEnvironmentRepository implements IEnvironmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateEnvironmentInput & { id: string; slug: string; createdBy: string }): Promise<Environment> {
    const row = await this.prisma.environment.create({
      data: {
        id: input.id,
        projectId: input.projectId,
        name: input.name,
        type: input.type,
        slug: input.slug,
        description: input.description,
        isDefault: input.isDefault ?? false,
        order: input.order ?? 0,
        parentId: input.parentId,
        protected: input.protected ?? false,
        requiresApproval: input.requiresApproval ?? false,
        createdBy: input.createdBy,
      },
    });
    return toEnvironment(row);
  }

  async update(id: string, input: UpdateEnvironmentInput): Promise<Environment> {
    const row = await this.prisma.environment.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        ...(input.protected !== undefined && { protected: input.protected }),
        ...(input.requiresApproval !== undefined && { requiresApproval: input.requiresApproval }),
      },
    });
    return toEnvironment(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.environment.delete({ where: { id } });
  }

  async findById(id: string): Promise<Environment | null> {
    const row = await this.prisma.environment.findUnique({ where: { id } });
    return row ? toEnvironment(row) : null;
  }

  async findByProject(projectId: string): Promise<Environment[]> {
    const rows = await this.prisma.environment.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
    return rows.map(toEnvironment);
  }

  async findBySlug(projectId: string, slug: string): Promise<Environment | null> {
    const row = await this.prisma.environment.findUnique({ where: { projectId_slug: { projectId, slug } } });
    return row ? toEnvironment(row) : null;
  }

  async getDefault(projectId: string): Promise<Environment | null> {
    const row = await this.prisma.environment.findFirst({
      where: { projectId, isDefault: true },
    });
    return row ? toEnvironment(row) : null;
  }

  async createPromotionRequest(input: Partial<EnvironmentPromotionRequest> & { id: string; requestedBy: string; status: 'pending' }): Promise<EnvironmentPromotionRequest> {
    const row = await this.prisma.environmentPromotionRequest.create({
      data: {
        id: input.id,
        environmentId: input.environmentId!,
        targetEnvironmentId: input.targetEnvironmentId!,
        configIds: input.configIds ?? [],
        status: input.status,
        requestedBy: input.requestedBy,
      },
    });
    return toPromotionRequest(row);
  }

  async approvePromotionRequest(id: string, approvedBy: string): Promise<EnvironmentPromotionRequest> {
    const row = await this.prisma.environmentPromotionRequest.update({
      where: { id },
      data: { status: 'approved', approvedBy, approvedAt: new Date() },
    });
    return toPromotionRequest(row);
  }

  async rejectPromotionRequest(id: string, rejectedBy: string): Promise<EnvironmentPromotionRequest> {
    const row = await this.prisma.environmentPromotionRequest.update({
      where: { id },
      data: { status: 'rejected', approvedBy: rejectedBy },
    });
    return toPromotionRequest(row);
  }

  async completePromotion(id: string): Promise<EnvironmentPromotionRequest> {
    const row = await this.prisma.environmentPromotionRequest.update({
      where: { id },
      data: { status: 'promoted', promotedAt: new Date() },
    });
    return toPromotionRequest(row);
  }

  async getPromotionRequestById(id: string): Promise<EnvironmentPromotionRequest | null> {
    const row = await this.prisma.environmentPromotionRequest.findUnique({ where: { id } });
    return row ? toPromotionRequest(row) : null;
  }

  async getPromotionRequests(environmentId: string): Promise<EnvironmentPromotionRequest[]> {
    const rows = await this.prisma.environmentPromotionRequest.findMany({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toPromotionRequest);
  }

  async createSnapshot(input: Partial<EnvironmentSnapshot> & { id: string; createdBy: string }): Promise<EnvironmentSnapshot> {
    const row = await this.prisma.environmentSnapshot.create({
      data: {
        id: input.id,
        environmentId: input.environmentId!,
        label: input.label!,
        configValues: input.configValues as any,
        createdBy: input.createdBy,
      },
    });
    return toSnapshot(row);
  }

  async getSnapshots(environmentId: string): Promise<EnvironmentSnapshot[]> {
    const rows = await this.prisma.environmentSnapshot.findMany({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toSnapshot);
  }
}