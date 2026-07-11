import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IInstallRepository, IVersionRepository, IListingRepository } from '../domain/repository-interfaces';
import type { MarketplaceInstall } from '@forge/marketplace-types';

@Injectable()
export class InstallService {
  constructor(
    @Inject('IInstallRepository') private readonly installRepo: IInstallRepository,
    @Inject('IVersionRepository') private readonly versionRepo: IVersionRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  async findByProject(projectId: string): Promise<MarketplaceInstall[]> {
    return this.installRepo.findByProject(projectId);
  }

  async install(listingId: string, projectId: string, installedBy: string, version?: string, config?: Record<string, unknown>): Promise<MarketplaceInstall> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) throw new NotFoundException('Listing not found');

    const existing = await this.installRepo.findInstall(listingId, projectId);
    if (existing) throw new BadRequestException('Already installed');

    const targetVersion = version || (await this.versionRepo.getLatest(listingId))?.version;
    if (!targetVersion) throw new BadRequestException('No version available');

    const install = await this.installRepo.create({ listingId, projectId, version: targetVersion, config, installedBy });
    await this.listingRepo.incrementInstallCount(listingId);
    return install;
  }

  async uninstall(listingId: string, projectId: string): Promise<void> {
    const install = await this.installRepo.findInstall(listingId, projectId);
    if (!install) throw new NotFoundException('Installation not found');
    await this.installRepo.remove(install.id);
  }
}
