import { Injectable, Inject } from '@nestjs/common';
import type { IRbacRoleRepository, IRbacPermissionRepository, IRbacMemberRepository } from '../domain/repository-interfaces';
import type { RbacRole } from '@forge/enterprise-types';

@Injectable()
export class RbacService {
  constructor(
    @Inject('IRbacRoleRepository') private readonly roleRepo: IRbacRoleRepository,
    @Inject('IRbacPermissionRepository') private readonly permRepo: IRbacPermissionRepository,
    @Inject('IRbacMemberRepository') private readonly memberRepo: IRbacMemberRepository,
  ) {}

  async getRoles(projectId: string): Promise<RbacRole[]> {
    return this.roleRepo.findByProject(projectId);
  }

  async getRole(id: string): Promise<RbacRole> {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new Error('Role not found');
    return role;
  }

  async createRole(data: { projectId: string; name: string; slug: string; description?: string; sortOrder?: number }): Promise<RbacRole> {
    return this.roleRepo.create(data);
  }

  async updateRole(id: string, data: Partial<RbacRole>): Promise<RbacRole> {
    return this.roleRepo.update(id, data);
  }

  async deleteRole(id: string): Promise<void> {
    await this.roleRepo.delete(id);
  }

  async getPermissions(roleId: string) {
    return this.permRepo.findByRole(roleId);
  }

  async addPermission(data: { roleId: string; resource: string; action: string; conditions?: Record<string, unknown>; effect?: string }) {
    return this.permRepo.create(data);
  }

  async updatePermission(id: string, data: { conditions?: Record<string, unknown>; effect?: string }) {
    return this.permRepo.update(id, data);
  }

  async removePermission(id: string) {
    await this.permRepo.delete(id);
  }

  async getMembers(roleId: string) {
    return this.memberRepo.findByRole(roleId);
  }

  async addMember(data: { roleId: string; identityId: string; projectId?: string; grantedBy?: string; expiresAt?: string }) {
    return this.memberRepo.add(data);
  }

  async removeMember(id: string) {
    await this.memberRepo.remove(id);
  }

  async findIdentityRoles(identityId: string) {
    return this.memberRepo.findByIdentity(identityId);
  }
}
