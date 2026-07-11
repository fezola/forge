import { Injectable } from '@nestjs/common';
import { InstallConnectorUseCase } from './install-connector.use-case';
import { UninstallConnectorUseCase } from './uninstall-connector.use-case';
import { UpdateConnectorUseCase } from './update-connector.use-case';
import { IInstallationRepository } from '../domain/installation.repository.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class ConnectorRegistryService {
  constructor(
    private readonly installUseCase: InstallConnectorUseCase,
    private readonly uninstallUseCase: UninstallConnectorUseCase,
    private readonly updateUseCase: UpdateConnectorUseCase,
    @Inject('IInstallationRepository')
    private readonly repo: IInstallationRepository,
  ) {}

  async list(projectId: string) {
    return this.repo.findByProject(projectId);
  }

  async get(id: string) {
    return this.repo.findById(id);
  }

  async install(projectId: string, manifestId: string, config?: Record<string, unknown>) {
    return this.installUseCase.execute(projectId, manifestId, config);
  }

  async uninstall(id: string) {
    return this.uninstallUseCase.execute(id);
  }

  async update(id: string, config?: Record<string, unknown>) {
    return this.updateUseCase.execute(id, config);
  }

  async toggle(id: string, enabled: boolean) {
    return this.repo.update(id, { enabled } as any);
  }
}
