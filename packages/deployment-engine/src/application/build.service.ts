import { Injectable, Inject } from '@nestjs/common';
import type { IBuildConfigRepository } from '../domain/repository-interfaces';
import type { DeploymentBuildConfig } from '@forge/deployment-types';

@Injectable()
export class BuildService {
  constructor(@Inject('IBuildConfigRepository') private readonly repo: IBuildConfigRepository) {}

  async findByEnvironment(environmentId: string): Promise<DeploymentBuildConfig | null> {
    return this.repo.findByEnvironment(environmentId);
  }

  async upsert(environmentId: string, data: { provider?: string; dockerfilePath?: string; buildArgs?: Record<string, unknown>; cacheFrom?: string[]; platform?: string; resourceClass?: string; timeoutSec?: number }): Promise<DeploymentBuildConfig> {
    return this.repo.upsert(environmentId, data);
  }

  async delete(environmentId: string): Promise<void> {
    await this.repo.delete(environmentId);
  }
}
