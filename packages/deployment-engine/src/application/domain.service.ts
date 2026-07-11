import { Injectable, Inject } from '@nestjs/common';
import type { IDomainRepository } from '../domain/repository-interfaces';
import type { DeploymentDomain } from '@forge/deployment-types';

@Injectable()
export class DomainService {
  constructor(@Inject('IDomainRepository') private readonly repo: IDomainRepository) {}

  async findByEnvironment(environmentId: string): Promise<DeploymentDomain[]> {
    return this.repo.findByEnvironment(environmentId);
  }

  async findById(id: string): Promise<DeploymentDomain> {
    const domain = await this.repo.findById(id);
    if (!domain) throw new Error('Domain not found');
    return domain;
  }

  async create(data: { environmentId: string; domain: string; isPrimary?: boolean; verificationMethod?: string; redirectTo?: string }): Promise<DeploymentDomain> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<DeploymentDomain>): Promise<DeploymentDomain> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
