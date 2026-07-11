import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IVersionRepository, IComponentRepository } from '../domain/repository-interfaces';
import type { ComponentVersion } from '@forge/component-types';

@Injectable()
export class VersionService {
  constructor(
    @Inject('IVersionRepository') private readonly versionRepo: IVersionRepository,
    @Inject('IComponentRepository') private readonly componentRepo: IComponentRepository,
  ) {}

  async findByComponent(componentId: string): Promise<ComponentVersion[]> {
    return this.versionRepo.findByComponent(componentId);
  }

  async getLatest(componentId: string): Promise<ComponentVersion> {
    const version = await this.versionRepo.getLatest(componentId);
    if (!version) throw new NotFoundException('No versions found');
    return version;
  }

  async create(data: { componentId: string; version: string; changelog?: string; packageUrl?: string; sourceUrl?: string; entryPoint?: string; dependencies?: string[]; peerDependencies?: string[]; sizeBytes?: number }): Promise<ComponentVersion> {
    const component = await this.componentRepo.findById(data.componentId);
    if (!component) throw new NotFoundException('Component not found');
    return this.versionRepo.create(data);
  }

  async publish(versionId: string): Promise<void> {
    const version = await this.versionRepo.findById(versionId);
    if (!version) throw new NotFoundException('Version not found');
    await this.versionRepo.publish(versionId);
    await this.componentRepo.publish(version.componentId);
  }
}
