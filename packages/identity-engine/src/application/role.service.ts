import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import type { IRoleRepository } from '@forge/identity-types';
import { Role, SYSTEM_ROLES } from '@forge/identity-types';

@Injectable()
export class RoleService {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    return this.roleRepository.create(role);
  }

  async get(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, data: Partial<Role>): Promise<Role> {
    return this.roleRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async getByProject(projectId: string): Promise<Role[]> {
    return this.roleRepository.findByProject(projectId);
  }

  async getByOrganization(organizationId: string): Promise<Role[]> {
    return this.roleRepository.findByOrganization(organizationId);
  }

  async getIdentityRoles(identityId: string, organizationId?: string): Promise<Role[]> {
    return this.roleRepository.getIdentityRoles(identityId, organizationId);
  }

  async assignRole(identityId: string, roleId: string, organizationId?: string): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundException('Role not found');
    const existing = await this.roleRepository.getIdentityRoles(identityId, organizationId);
    if (existing.some(r => r.id === roleId)) {
      throw new ConflictException('Role already assigned');
    }
    await this.roleRepository.assignRole(identityId, roleId, organizationId);
  }

  async removeRole(identityId: string, roleId: string, organizationId?: string): Promise<void> {
    await this.roleRepository.removeRole(identityId, roleId, organizationId);
  }

  static getSystemRoles(projectId: string): Array<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>> {
    return Object.entries(SYSTEM_ROLES).map(([_name, role]) => ({
      ...role,
      name: role.name,
      projectId,
      isSystem: true,
    }));
  }
}