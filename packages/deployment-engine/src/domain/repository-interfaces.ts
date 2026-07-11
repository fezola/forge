import type { DeploymentEnvironment, Deployment, DeploymentDomain, DeploymentBuildConfig, DeploymentSecret } from '@forge/deployment-types';

export interface IEnvironmentRepository {
  findByProject(projectId: string): Promise<DeploymentEnvironment[]>;
  findById(id: string): Promise<DeploymentEnvironment | null>;
  findBySlug(projectId: string, slug: string): Promise<DeploymentEnvironment | null>;
  create(data: { projectId: string; name: string; slug: string; type?: string; branch?: string; autoDeploy?: boolean; buildCommand?: string; outputDir?: string; nodeVersion?: string; installCommand?: string; envVars?: Record<string, unknown>; status?: string; sortOrder?: number }): Promise<DeploymentEnvironment>;
  update(id: string, data: Partial<DeploymentEnvironment>): Promise<DeploymentEnvironment>;
  delete(id: string): Promise<void>;
}

export interface IDeploymentRepository {
  findByEnvironment(environmentId: string, limit?: number): Promise<Deployment[]>;
  findByProject(projectId: string, limit?: number): Promise<Deployment[]>;
  findById(id: string): Promise<Deployment | null>;
  create(data: { environmentId: string; projectId: string; version: string; branch?: string; commitSha?: string; commitMessage?: string; commitAuthor?: string; commitUrl?: string; deployedBy: string; metadata?: Record<string, unknown> }): Promise<Deployment>;
  update(id: string, data: Partial<Deployment>): Promise<Deployment>;
  rollback(id: string, rolledBackById: string): Promise<Deployment>;
  getLatest(environmentId: string): Promise<Deployment | null>;
}

export interface IDomainRepository {
  findByEnvironment(environmentId: string): Promise<DeploymentDomain[]>;
  findById(id: string): Promise<DeploymentDomain | null>;
  findByDomain(domain: string): Promise<DeploymentDomain | null>;
  create(data: { environmentId: string; domain: string; isPrimary?: boolean; verificationMethod?: string; redirectTo?: string }): Promise<DeploymentDomain>;
  update(id: string, data: Partial<DeploymentDomain>): Promise<DeploymentDomain>;
  delete(id: string): Promise<void>;
}

export interface IBuildConfigRepository {
  findByEnvironment(environmentId: string): Promise<DeploymentBuildConfig | null>;
  upsert(environmentId: string, data: { provider?: string; dockerfilePath?: string; buildArgs?: Record<string, unknown>; cacheFrom?: string[]; platform?: string; resourceClass?: string; timeoutSec?: number }): Promise<DeploymentBuildConfig>;
  delete(environmentId: string): Promise<void>;
}

export interface ISecretRepository {
  findByEnvironment(environmentId: string): Promise<DeploymentSecret[]>;
  findByName(environmentId: string, name: string): Promise<DeploymentSecret | null>;
  create(data: { environmentId: string; projectId: string; name: string; value: string; isBuildTime?: boolean }): Promise<DeploymentSecret>;
  update(id: string, data: { value?: string; isBuildTime?: boolean }): Promise<DeploymentSecret>;
  delete(id: string): Promise<void>;
}
