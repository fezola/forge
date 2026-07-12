import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EnterpriseFacade {
  constructor(private readonly prisma: PrismaClient) {}

  // ── SSO ──

  async getSsoProviders(projectId?: string) {
    return this.prisma.ssoProvider.findMany({
      where: projectId ? { projectId } : {},
      include: { _count: { select: { domains: true } }, samlConfig: true, oidcConfig: true },
    });
  }

  async getSsoProvider(id: string) {
    return this.prisma.ssoProvider.findUnique({ where: { id }, include: { domains: true, samlConfig: true, oidcConfig: true } });
  }

  async createSsoProvider(data: any) {
    return this.prisma.ssoProvider.create({ data });
  }

  async updateSsoProvider(id: string, data: any) {
    return this.prisma.ssoProvider.update({ where: { id }, data });
  }

  async deleteSsoProvider(id: string) {
    await this.prisma.ssoProvider.delete({ where: { id } });
  }

  async getSsoDomains(providerId: string) {
    return this.prisma.ssoDomain.findMany({ where: { providerId } });
  }

  async createSsoDomain(data: { providerId: string; domain: string }) {
    return this.prisma.ssoDomain.create({ data });
  }

  async verifySsoDomain(id: string) {
    return this.prisma.ssoDomain.update({ where: { id }, data: { verified: true, verifiedAt: new Date() } });
  }

  async deleteSsoDomain(id: string) {
    await this.prisma.ssoDomain.delete({ where: { id } });
  }

  async upsertSamlConfig(providerId: string, data: any) {
    return this.prisma.samlConfig.upsert({ where: { providerId }, create: { providerId, ...data }, update: data });
  }

  async upsertOidcConfig(providerId: string, data: any) {
    return this.prisma.oidcConfig.upsert({ where: { providerId }, create: { providerId, ...data }, update: data });
  }

  // ── RBAC ──

  async getRoles(projectId?: string) {
    return this.prisma.rbacRole.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { permissions: true, members: true } } },
    });
  }

  async getRole(id: string) {
    return this.prisma.rbacRole.findUnique({ where: { id }, include: { permissions: true, members: true } });
  }

  async createRole(data: any) {
    return this.prisma.rbacRole.create({ data });
  }

  async updateRole(id: string, data: any) {
    return this.prisma.rbacRole.update({ where: { id }, data });
  }

  async deleteRole(id: string) {
    await this.prisma.rbacRole.delete({ where: { id } });
  }

  async getPermissions(roleId: string) {
    return this.prisma.rbacPermission.findMany({ where: { roleId } });
  }

  async createPermission(data: any) {
    return this.prisma.rbacPermission.create({ data });
  }

  async deletePermission(id: string) {
    await this.prisma.rbacPermission.delete({ where: { id } });
  }

  async getRoleMembers(roleId: string) {
    return this.prisma.rbacRoleMember.findMany({ where: { roleId } });
  }

  async addRoleMember(data: any) {
    return this.prisma.rbacRoleMember.create({ data });
  }

  async removeRoleMember(id: string) {
    await this.prisma.rbacRoleMember.delete({ where: { id } });
  }

  // ── Audit ──

  async getAuditEvents(params: { projectId?: string; action?: string; resourceType?: string; severity?: string; actorId?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    if (params.action) where.action = params.action;
    if (params.resourceType) where.resourceType = params.resourceType;
    if (params.severity) where.severity = params.severity;
    if (params.actorId) where.actorId = params.actorId;
    const [events, total] = await Promise.all([
      this.prisma.auditEvent.findMany({ where, orderBy: { timestamp: 'desc' }, take: params.limit || 100, skip: params.offset || 0 }),
      this.prisma.auditEvent.count({ where }),
    ]);
    return { events, total };
  }

  async getAuditEvent(id: string) {
    return this.prisma.auditEvent.findUnique({ where: { id } });
  }

  async recordAuditEvent(data: any) {
    return this.prisma.auditEvent.create({ data });
  }

  // ── Compliance ──

  async getComplianceReports(projectId?: string) {
    return this.prisma.complianceReport.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getComplianceReport(id: string) {
    return this.prisma.complianceReport.findUnique({ where: { id } });
  }

  async createComplianceReport(data: any) {
    return this.prisma.complianceReport.create({ data });
  }

  async updateComplianceReport(id: string, data: any) {
    return this.prisma.complianceReport.update({ where: { id }, data });
  }

  async deleteComplianceReport(id: string) {
    await this.prisma.complianceReport.delete({ where: { id } });
  }

  // ── Enterprise Settings ──

  async getEnterpriseSettings(projectId: string) {
    return this.prisma.enterpriseSettings.findUnique({ where: { projectId } });
  }

  async upsertEnterpriseSettings(projectId: string, data: any) {
    return this.prisma.enterpriseSettings.upsert({ where: { projectId }, create: { projectId, ...data }, update: data });
  }

  // ── Stats ──

  async getStats(projectId?: string) {
    const [ssoProviders, roles, auditEvents, complianceReports] = await Promise.all([
      this.prisma.ssoProvider.count(projectId ? { where: { projectId } } : { where: {} }),
      this.prisma.rbacRole.count(projectId ? { where: { projectId } } : { where: {} }),
      this.prisma.auditEvent.count(projectId ? { where: { projectId } } : { where: {} }),
      this.prisma.complianceReport.count(projectId ? { where: { projectId } } : { where: {} }),
    ]);
    return { ssoProviders, roles, auditEvents, complianceReports };
  }
}
