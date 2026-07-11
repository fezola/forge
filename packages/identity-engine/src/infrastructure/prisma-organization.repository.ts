import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IOrganizationRepository, Organization, CreateOrganizationRequest, UpdateOrganization, OrganizationMember, OrganizationInvite, InviteMemberRequest } from '@forge/identity-types';
import { OrganizationEntity } from '../domain/organization.entity';

@Injectable()
export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Organization | null> {
    const data = await this.prisma.organization.findUnique({ where: { id } });
    return data ? this.toEntity(data) : null;
  }

  async findBySlug(projectId: string, slug: string): Promise<Organization | null> {
    const data = await this.prisma.organization.findFirst({ where: { projectId, slug } });
    return data ? this.toEntity(data) : null;
  }

  async findByIdentity(identityId: string): Promise<Organization[]> {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { identityId },
      include: { organization: true },
    });
    return memberships.map((m: any) => this.toEntity(m.organization as any));
  }

  async create(request: CreateOrganizationRequest): Promise<Organization> {
    const entity = OrganizationEntity.create(request);
    await this.prisma.organization.create({
      data: {
        id: entity.id,
        projectId: entity.projectId,
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
        logoUrl: entity.logoUrl,
        ownerId: entity.ownerId,
        settings: entity.settings as any,
        memberCount: 1,
      },
    });
    return entity;
  }

  async update(id: string, data: UpdateOrganization): Promise<Organization> {
    const entity = await this.findById(id);
    if (!entity) throw new Error('Organization not found');
    Object.assign(entity, data as any);
    (entity as OrganizationEntity).update(data as any);
    await this.prisma.organization.update({
      where: { id },
      data: {
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
        logoUrl: entity.logoUrl,
        settings: entity.settings as any,
      },
    });
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }

  async addMember(identityId: string, organizationId: string, roleId: string, invitedBy: string): Promise<OrganizationMember> {
    const member = await this.prisma.organizationMember.create({
      data: { identityId, organizationId, roleId, invitedBy },
    });
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { memberCount: { increment: 1 } },
    });
    return this.toMember(member);
  }

  async removeMember(identityId: string, organizationId: string): Promise<void> {
    await this.prisma.organizationMember.deleteMany({
      where: { identityId, organizationId },
    });
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { memberCount: { decrement: 1 } },
    });
  }

  async updateMemberRole(identityId: string, organizationId: string, roleId: string): Promise<void> {
    await this.prisma.organizationMember.updateMany({
      where: { identityId, organizationId },
      data: { roleId },
    });
  }

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: { identity: { select: { displayName: true, primaryEmail: true, avatarUrl: true } } },
    });
    return members.map((m: any) => this.toMember(m));
  }

  async createInvite(request: InviteMemberRequest): Promise<OrganizationInvite> {
    const invite = await this.prisma.organizationInvite.create({
      data: {
        organizationId: request.organizationId,
        email: request.email,
        roleId: request.roleId,
        invitedBy: request.invitedById,
        token: this.generateToken(),
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        message: request.message,
      },
    });
    return this.toInvite(invite);
  }

  async acceptInvite(token: string, identityId: string): Promise<void> {
    const invite = await this.prisma.organizationInvite.findUnique({ where: { token } });
    if (!invite || invite.status !== 'pending') throw new Error('Invalid or expired invite');
    if (new Date(invite.expiresAt) < new Date()) throw new Error('Invite expired');
    await this.prisma.organizationMember.create({
      data: { identityId, organizationId: invite.organizationId, roleId: invite.roleId, invitedBy: invite.invitedBy },
    });
    await this.prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { status: 'accepted' },
    });
    await this.prisma.organization.update({
      where: { id: invite.organizationId },
      data: { memberCount: { increment: 1 } },
    });
  }

  async cancelInvite(id: string): Promise<void> {
    await this.prisma.organizationInvite.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async findInvitesByEmail(email: string): Promise<OrganizationInvite[]> {
    const invites = await this.prisma.organizationInvite.findMany({ where: { email, status: 'pending' } });
    return invites.map((i: any) => this.toInvite(i));
  }

  private toEntity(data: any): Organization {
    return new OrganizationEntity({
      id: data.id,
      projectId: data.projectId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      logoUrl: data.logoUrl,
      ownerId: data.ownerId,
      settings: data.settings ?? {},
      memberCount: data.memberCount ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toMember(data: any): OrganizationMember {
    return {
      identityId: data.identityId,
      organizationId: data.organizationId,
      roleId: data.roleId,
      roleName: '',
      joinedAt: data.createdAt ?? data.joinedAt,
      invitedBy: data.invitedBy,
      status: data.status ?? 'active',
      displayName: data.identity?.displayName ?? '',
      email: data.identity?.primaryEmail ?? null,
      avatarUrl: data.identity?.avatarUrl ?? null,
    };
  }

  private toInvite(data: any): OrganizationInvite {
    return {
      id: data.id,
      organizationId: data.organizationId,
      email: data.email,
      roleId: data.roleId,
      token: data.token,
      expiresAt: data.expiresAt,
      invitedBy: data.invitedBy,
      status: data.status,
      createdAt: data.createdAt,
    };
  }

  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    return token;
  }
}