import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInstallationRepository } from '../domain/installation.repository.interface';
import { IManifestLoader } from '../domain/manifest.loader.interface';

@Injectable()
export class UpdateConnectorUseCase {
  constructor(
    @Inject('IInstallationRepository')
    private readonly repo: IInstallationRepository,
    @Inject('IManifestLoader')
    private readonly loader: IManifestLoader,
  ) {}

  async execute(id: string, config?: Record<string, unknown>) {
    const installation = await this.repo.findById(id);
    if (!installation) throw new NotFoundException('Connector installation not found');

    if (config) {
      installation.config = config;
    }
    return this.repo.update(id, { config: installation.config } as any);
  }
}
