import { Injectable, Inject } from '@nestjs/common';
import type { ISecretRepository } from '../domain/repository-interfaces';
import type { DeploymentSecret } from '@forge/deployment-types';

@Injectable()
export class SecretService {
  constructor(@Inject('ISecretRepository') private readonly repo: ISecretRepository) {}

  async findByEnvironment(environmentId: string): Promise<DeploymentSecret[]> {
    return this.repo.findByEnvironment(environmentId);
  }

  async create(data: { environmentId: string; projectId: string; name: string; value: string; isBuildTime?: boolean }): Promise<DeploymentSecret> {
    return this.repo.create(data);
  }

  async update(id: string, data: { value?: string; isBuildTime?: boolean }): Promise<DeploymentSecret> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
