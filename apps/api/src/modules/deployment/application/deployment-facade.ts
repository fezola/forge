import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeploymentFacade {
  constructor(private readonly prisma: PrismaClient) {}

  async getEnvironments(projectId?: string) {
    return this.prisma.deploymentEnvironment.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { deployments: true, domains: true, secrets: true } } },
    });
  }

  async getEnvironment(id: string) {
    return this.prisma.deploymentEnvironment.findUnique({
      where: { id },
      include: { domains: true, buildConfig: true, deployments: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  async createEnvironment(data: { projectId: string; name: string; slug: string; type?: string; branch?: string; autoDeploy?: boolean; buildCommand?: string; outputDir?: string; nodeVersion?: string; installCommand?: string; envVars?: any; sortOrder?: number }) {
    return this.prisma.deploymentEnvironment.create({ data });
  }

  async updateEnvironment(id: string, data: any) {
    return this.prisma.deploymentEnvironment.update({ where: { id }, data });
  }

  async deleteEnvironment(id: string) {
    await this.prisma.deploymentEnvironment.delete({ where: { id } });
  }

  async getDeployments(environmentId?: string, projectId?: string) {
    const where: any = {};
    if (environmentId) where.environmentId = environmentId;
    if (projectId) where.projectId = projectId;
    return this.prisma.deployment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { environment: { select: { name: true, slug: true, type: true } } },
    });
  }

  async getDeployment(id: string) {
    return this.prisma.deployment.findUnique({ where: { id }, include: { environment: true } });
  }

  async createDeployment(data: { environmentId: string; projectId: string; version: string; branch?: string; commitSha?: string; commitMessage?: string; commitAuthor?: string; commitUrl?: string; deployedBy: string }) {
    return this.prisma.deployment.create({ data });
  }

  async updateDeployment(id: string, data: any) {
    return this.prisma.deployment.update({ where: { id }, data });
  }

  async rollback(id: string) {
    const dep = await this.prisma.deployment.findUnique({ where: { id } });
    if (!dep) throw new Error('Deployment not found');
    return this.prisma.deployment.update({ where: { id }, data: { status: 'rolled_back', rollbackToId: null } });
  }

  async getDomains(environmentId?: string) {
    return this.prisma.deploymentDomain.findMany({
      where: environmentId ? { environmentId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDomain(data: { environmentId: string; domain: string; isPrimary?: boolean; verificationMethod?: string; redirectTo?: string }) {
    return this.prisma.deploymentDomain.create({ data });
  }

  async deleteDomain(id: string) {
    await this.prisma.deploymentDomain.delete({ where: { id } });
  }

  async getBuildConfig(environmentId: string) {
    return this.prisma.deploymentBuildConfig.findUnique({ where: { environmentId } });
  }

  async upsertBuildConfig(environmentId: string, data: any) {
    return this.prisma.deploymentBuildConfig.upsert({
      where: { environmentId },
      create: { environmentId, ...data },
      update: data,
    });
  }

  async getSecrets(environmentId: string) {
    return this.prisma.deploymentSecret.findMany({ where: { environmentId } });
  }

  async createSecret(data: { environmentId: string; projectId: string; name: string; value: string; isBuildTime?: boolean }) {
    return this.prisma.deploymentSecret.create({ data });
  }

  async updateSecret(id: string, data: any) {
    return this.prisma.deploymentSecret.update({ where: { id }, data });
  }

  async deleteSecret(id: string) {
    await this.prisma.deploymentSecret.delete({ where: { id } });
  }

  async getStats() {
    const [totalEnvironments, totalDeployments, activeDeployments, failedDeployments] = await Promise.all([
      this.prisma.deploymentEnvironment.count(),
      this.prisma.deployment.count(),
      this.prisma.deployment.count({ where: { status: 'active' } }),
      this.prisma.deployment.count({ where: { status: 'failed' } }),
    ]);
    return { totalEnvironments, totalDeployments, activeDeployments, failedDeployments };
  }
}
