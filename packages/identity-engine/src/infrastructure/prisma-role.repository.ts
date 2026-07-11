import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Role, IRoleRepository } from '@forge/identity-types';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Role | null> {
    const data = await (this.prisma as any).role.findUnique({ where: { id } });
    return data ? this.toRole(data) : null;
  }

  async findByProject(projectId: string): Promise<Role[]> {
    const data = await (this.prisma as any).role.findMany({ where: { projectId } });
    return data.map((r: any) => this.toRole(r));
  }

  async findByOrganization(organizationId: string): Promise<Role[]> {
    const data = await (this.prisma as any).role.findMany({ where: { organizationId } });
    return data.map((r: any) => this.toRole(r));
  }

  async create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const data = await (this.prisma as any).role.create({
      data: {
        id: crypto.randomUUID(),
        ...role,
        permissions: role.permissions,
        isSystem: role.isSystem,
      },
    });
    return this.toRole(data);
  }

  async update(id: string, data: Partial<Role>): Promise<Role> {
    const updated = await (this.prisma as any).role.update({
      where: { id },
      data: {
        ...data,
        permissions: data.permissions,
      },
    });
    return this.toRole(updated);
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).role.delete({ where: { id } });
  }

  async getIdentityRoles(identityId: string, organizationId?: string): Promise<Role[]> {
    const where: any = { identityId };
    if (organizationId) where.organizationId = organizationId;
    const assignments = await (this.prisma as any).identityRole.findMany({
      where,
      include: { role: true },
    });
    return assignments.map((a: any) => this.toRole(a.role));
  }

  async assignRole(identityId: string, roleId: string, organizationId?: string): Promise<void> {
    await (this.prisma as any).identityRole.create({
      data: { identityId, roleId, organizationId: organizationId ?? null },
    });
  }

  async removeRole(identityId: string, roleId: string, organizationId?: string): Promise<void> {
    const where: any = { identityId, roleId };
    if (organizationId) where.organizationId = organizationId;
    await (this.prisma as any).identityRole.deleteMany({ where });
  }

  private toRole(data: any): Role {
    return {
      id: data.id,
      projectId: data.projectId,
      organizationId: data.organizationId ?? null,
      name: data.name,
      description: data.description ?? null,
      permissions: data.permissions ?? [],
      isSystem: data.isSystem ?? false,
      priority: data.priority ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}