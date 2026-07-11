import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ForgeIdentity, CreateIdentityRequest, UpdateIdentity, IdentitySummary } from '@forge/identity-types';
import { IIdentityRepository } from '../domain/identity.repository.interface';
import { IdentityEntity } from '../domain/identity.entity';

@Injectable()
export class PrismaIdentityRepository implements IIdentityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<IdentityEntity | null> {
    const data = await this.prisma.identity.findUnique({ where: { id } });
    return data ? this.toEntity(data) : null;
  }

  async findByEmail(email: string): Promise<IdentityEntity | null> {
    const data = await this.prisma.identity.findFirst({ where: { primaryEmail: email } });
    return data ? this.toEntity(data) : null;
  }

  async findByPhone(phone: string): Promise<IdentityEntity | null> {
    const data = await this.prisma.identity.findFirst({ where: { primaryPhone: phone } });
    return data ? this.toEntity(data) : null;
  }

  async findByProject(projectId: string, offset = 0, limit = 50): Promise<{ items: IdentitySummary[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.identity.findMany({
        where: { projectId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.identity.count({ where: { projectId } }),
    ]);
    return { items: items.map((i: PrismaIdentity) => this.toEntity(i).toSummary()), total };
  }

  async findByProvider(provider: string, providerUserId: string): Promise<IdentityEntity | null> {
    const link = await this.prisma.identityProvider.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: { identity: true },
    });
    return link ? this.toEntity(link.identity as unknown as PrismaIdentity) : null;
  }

  async create(data: CreateIdentityRequest): Promise<IdentityEntity> {
    const entity = IdentityEntity.create(data);
    await this.prisma.identity.create({
      data: {
        id: entity.id,
        projectId: entity.projectId,
        displayName: entity.displayName,
        primaryEmail: entity.primaryEmail,
        primaryPhone: entity.primaryPhone,
        avatarUrl: entity.avatarUrl,
        status: entity.status,
        verifiedEmails: entity.verifiedEmails,
        verifiedPhones: entity.verifiedPhones,
        wallets: entity.wallets,
        organizations: entity.organizations,
        defaultOrganizationId: entity.defaultOrganizationId,
        roles: entity.roles,
        permissions: entity.permissions,
        settings: entity.settings as any,
        metadata: entity.metadata as any,
      },
    });
    return entity;
  }

  async update(id: string, data: UpdateIdentity): Promise<IdentityEntity> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Identity not found');
    existing.update(data as any);
    await this.prisma.identity.update({
      where: { id },
      data: {
        displayName: existing.displayName,
        avatarUrl: existing.avatarUrl,
        status: existing.status,
        settings: existing.settings as any,
        metadata: existing.metadata as any,
        updatedAt: existing.updatedAt,
      },
    });
    return existing;
  }

  async updateInternal(id: string, data: Partial<ForgeIdentity>): Promise<void> {
    await this.prisma.identity.update({
      where: { id },
      data: {
        ...data,
        settings: data.settings as any,
        metadata: data.metadata as any,
        updatedAt: new Date().toISOString(),
      } as any,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.identity.delete({ where: { id } });
  }

  async addOrganization(identityId: string, organizationId: string): Promise<void> {
    const identity = await this.findById(identityId);
    if (!identity) throw new Error('Identity not found');
    identity.addOrganization(organizationId);
    await this.prisma.identity.update({
      where: { id: identityId },
      data: {
        organizations: identity.organizations,
        defaultOrganizationId: identity.defaultOrganizationId,
        updatedAt: identity.updatedAt,
      },
    });
  }

  async removeOrganization(identityId: string, organizationId: string): Promise<void> {
    const identity = await this.findById(identityId);
    if (!identity) throw new Error('Identity not found');
    identity.removeOrganization(organizationId);
    await this.prisma.identity.update({
      where: { id: identityId },
      data: {
        organizations: identity.organizations,
        defaultOrganizationId: identity.defaultOrganizationId,
        updatedAt: identity.updatedAt,
      },
    });
  }

  async countByProject(projectId: string): Promise<number> {
    return this.prisma.identity.count({ where: { projectId } });
  }

  private toEntity(data: any): IdentityEntity {
    return new IdentityEntity({
      id: data.id,
      projectId: data.projectId,
      displayName: data.displayName,
      primaryEmail: data.primaryEmail,
      primaryPhone: data.primaryPhone,
      avatarUrl: data.avatarUrl,
      status: data.status,
      verifiedEmails: data.verifiedEmails ?? [],
      verifiedPhones: data.verifiedPhones ?? [],
      providers: data.providers ?? [],
      wallets: data.wallets ?? [],
      organizations: data.organizations ?? [],
      defaultOrganizationId: data.defaultOrganizationId,
      roles: data.roles ?? [],
      permissions: data.permissions ?? [],
      metadata: data.metadata ?? {},
      settings: data.settings ?? {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt,
    });
  }
}

type PrismaIdentity = {
  id: string; projectId: string; displayName: string; primaryEmail: string | null;
  primaryPhone: string | null; avatarUrl: string | null; status: string;
  verifiedEmails: string[]; verifiedPhones: string[]; providers?: string[];
  wallets: string[]; organizations: string[]; defaultOrganizationId: string | null;
  roles: string[]; permissions: string[]; settings: Record<string, unknown>;
  metadata: Record<string, unknown>; createdAt: string; updatedAt: string; lastLoginAt: string | null;
  identity?: PrismaIdentity;
};