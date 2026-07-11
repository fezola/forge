import { Injectable, Inject } from '@nestjs/common';
import type { IDeploymentRepository } from '../domain/repository-interfaces';
import type { Deployment } from '@forge/deployment-types';

@Injectable()
export class DeploymentService {
  constructor(@Inject('IDeploymentRepository') private readonly repo: IDeploymentRepository) {}

  async findByEnvironment(environmentId: string, limit = 50): Promise<Deployment[]> {
    return this.repo.findByEnvironment(environmentId, limit);
  }

  async findByProject(projectId: string, limit = 50): Promise<Deployment[]> {
    return this.repo.findByProject(projectId, limit);
  }

  async findById(id: string): Promise<Deployment> {
    const dep = await this.repo.findById(id);
    if (!dep) throw new Error('Deployment not found');
    return dep;
  }

  async create(data: { environmentId: string; projectId: string; version: string; branch?: string; commitSha?: string; commitMessage?: string; commitAuthor?: string; commitUrl?: string; deployedBy: string; metadata?: Record<string, unknown> }): Promise<Deployment> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<Deployment>): Promise<Deployment> {
    return this.repo.update(id, data);
  }

  async getLatest(environmentId: string): Promise<Deployment | null> {
    return this.repo.getLatest(environmentId);
  }
}
