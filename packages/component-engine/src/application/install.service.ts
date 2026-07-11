import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IInstallRepository, IVersionRepository, IComponentRepository } from '../domain/repository-interfaces';
import type { ComponentInstall } from '@forge/component-types';

@Injectable()
export class InstallService {
  constructor(
    @Inject('IInstallRepository') private readonly installRepo: IInstallRepository,
    @Inject('IVersionRepository') private readonly versionRepo: IVersionRepository,
    @Inject('IComponentRepository') private readonly componentRepo: IComponentRepository,
  ) {}

  async findByProject(projectId: string): Promise<ComponentInstall[]> {
    return this.installRepo.findByProject(projectId);
  }

  async install(componentId: string, projectId: string, installedBy: string, version?: string, config?: Record<string, unknown>): Promise<ComponentInstall> {
    const component = await this.componentRepo.findById(componentId);
    if (!component) throw new NotFoundException('Component not found');

    const existing = await this.installRepo.findInstall(componentId, projectId);
    if (existing) throw new BadRequestException('Component already installed in this project');

    const targetVersion = version || (await this.versionRepo.getLatest(componentId))?.version;
    if (!targetVersion) throw new BadRequestException('No version available');

    const install = await this.installRepo.create({ componentId, projectId, version: targetVersion, config, installedBy });
    await this.componentRepo.incrementInstallCount(componentId);
    return install;
  }

  async uninstall(componentId: string, projectId: string): Promise<void> {
    const install = await this.installRepo.findInstall(componentId, projectId);
    if (!install) throw new NotFoundException('Installation not found');
    await this.installRepo.remove(install.id);
  }
}
