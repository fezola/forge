import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { IInstallationRepository } from '../domain/installation.repository.interface';
import { IManifestLoader } from '../domain/manifest.loader.interface';
import { ConnectorInstallationEntity } from '../domain/connector-installation.entity';

@Injectable()
export class InstallConnectorUseCase {
  constructor(
    @Inject('IInstallationRepository')
    private readonly repo: IInstallationRepository,
    @Inject('IManifestLoader')
    private readonly loader: IManifestLoader,
  ) {}

  async execute(projectId: string, manifestId: string, config?: Record<string, unknown>) {
    const manifest = await this.loader.load(manifestId);
    if (!manifest) throw new BadRequestException(`Connector "${manifestId}" not found`);

    const existing = await this.repo.findByName(projectId, manifest.name);
    if (existing) throw new ConflictException(`Connector "${manifest.name}" is already installed`);

    const installation = ConnectorInstallationEntity.install(projectId, manifest, config);
    return this.repo.create({
      id: installation.id,
      projectId: installation.projectId,
      manifestId: installation.manifestId,
      name: installation.name,
      version: installation.version,
      category: installation.category,
      status: installation.status,
      config: installation.config,
      enabled: installation.enabled,
    } as any);
  }
}
