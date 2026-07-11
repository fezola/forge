import { Injectable, Inject } from '@nestjs/common';
import { IMarketplaceRepository } from '../domain/marketplace.repository.interface';

@Injectable()
export class BrowseConnectorsUseCase {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
  ) {}

  async execute(query?: string, category?: string, page = 1, limit = 20) {
    if (query || category) {
      return this.repo.search(query || '', category, page, limit);
    }
    return this.repo.list(page, limit);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getByCategory(category: string) {
    return this.repo.listByCategory(category);
  }
}
