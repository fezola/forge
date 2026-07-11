import { Injectable, Inject } from '@nestjs/common';
import type { IEnvironmentRepository } from '../domain/repository-interfaces';
import type { DeploymentEnvironment } from '@forge/deployment-types';

@Injectable()
export class EnvironmentService {
  constructor(@Inject('IEnvironmentRepository') private readonly repo: IEnvironmentRepository) {}

  async findByProject(projectId: string): Promise<DeploymentEnvironment[]> {
    return this.repo.findByProject(projectId);
  }

  async findById(id: string): Promise<DeploymentEnvironment> {
    const env = await this.repo.findById(id);
    if (!env) throw new Error('Environment not found');
    return env;
  }

  async create(data: { projectId: string; name: string; slug: string; type?: string; branch?: string; autoDeploy?: boolean; buildCommand?: string; outputDir?: string; nodeVersion?: string; installCommand?: string; envVars?: Record<string, unknown>; sortOrder?: number }): Promise<DeploymentEnvironment> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<DeploymentEnvironment>): Promise<DeploymentEnvironment> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
