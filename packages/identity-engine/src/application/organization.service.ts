import { Injectable, Inject, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IOrganizationRepository, UpdateOrganization, Organization, OrganizationMember, OrganizationInvite, InviteMemberRequest } from '@forge/identity-types';
import { CreateOrganizationRequest } from '@forge/identity-types';
import type { IIdentityRepository } from '../domain/identity.repository.interface';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject('IOrganizationRepository')
    private readonly orgRepository: IOrganizationRepository,
    @Inject('IIdentityRepository')
    private readonly identityRepository: IIdentityRepository,
  ) {}

  async create(request: CreateOrganizationRequest): Promise<Organization> {
    const existing = await this.orgRepository.findBySlug(request.projectId, request.slug);
    if (existing) throw new ConflictException('Organization slug already taken');
    const org = await this.orgRepository.create(request);
    await this.orgRepository.addMember(request.ownerId, org.id, 'owner', request.ownerId);
    await this.identityRepository.addOrganization(request.ownerId, org.id);
    return org;
  }

  async get(id: string): Promise<Organization> {
    const org = await this.orgRepository.findById(id);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, data: UpdateOrganization): Promise<Organization> {
    const org = await this.orgRepository.findById(id);
    if (!org) throw new NotFoundException('Organization not found');
    if (data.slug && data.slug !== org.slug) {
      const existing = await this.orgRepository.findBySlug(org.projectId, data.slug);
      if (existing) throw new ConflictException('Organization slug already taken');
    }
    return this.orgRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const org = await this.orgRepository.findById(id);
    if (!org) throw new NotFoundException('Organization not found');
    const members = await this.orgRepository.getMembers(id);
    for (const member of members) {
      await this.identityRepository.removeOrganization(member.identityId, id);
    }
    await this.orgRepository.delete(id);
  }

  async addMember(identityId: string, organizationId: string, roleId: string, invitedBy: string): Promise<OrganizationMember> {
    const org = await this.orgRepository.findById(organizationId);
    if (!org) throw new NotFoundException('Organization not found');
    const members = await this.orgRepository.getMembers(organizationId);
    if (members.length >= org.settings.maxMembers) {
      throw new ForbiddenException('Organization member limit reached');
    }
    const member = await this.orgRepository.addMember(identityId, organizationId, roleId, invitedBy);
    await this.identityRepository.addOrganization(identityId, organizationId);
    return member;
  }

  async removeMember(identityId: string, organizationId: string): Promise<void> {
    await this.orgRepository.removeMember(identityId, organizationId);
    await this.identityRepository.removeOrganization(identityId, organizationId);
  }

  async updateMemberRole(identityId: string, organizationId: string, roleId: string): Promise<void> {
    await this.orgRepository.updateMemberRole(identityId, organizationId, roleId);
  }

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    return this.orgRepository.getMembers(organizationId);
  }

  async getByIdentity(identityId: string): Promise<Organization[]> {
    return this.orgRepository.findByIdentity(identityId);
  }

  async invite(request: InviteMemberRequest): Promise<OrganizationInvite> {
    return this.orgRepository.createInvite(request);
  }

  async acceptInvite(token: string, identityId: string): Promise<void> {
    await this.orgRepository.acceptInvite(token, identityId);
  }

  async cancelInvite(id: string): Promise<void> {
    await this.orgRepository.cancelInvite(id);
  }
}