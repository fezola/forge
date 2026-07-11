import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInstallationRepository } from '../domain/installation.repository.interface';

@Injectable()
export class UninstallConnectorUseCase {
  constructor(
    @Inject('IInstallationRepository')
    private readonly repo: IInstallationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const installation = await this.repo.findById(id);
    if (!installation) throw new NotFoundException('Connector installation not found');
    await this.repo.delete(id);
  }
}
