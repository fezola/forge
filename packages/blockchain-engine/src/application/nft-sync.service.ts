import { Injectable, Inject } from '@nestjs/common';
import type { INFTSyncRepository } from '../domain/repository-interfaces';
import type { NFTSync } from '@forge/blockchain-types';

@Injectable()
export class NFTSyncService {
  constructor(@Inject('INFTSyncRepository') private readonly nftRepo: INFTSyncRepository) {}

  async findByProject(projectId: string): Promise<NFTSync[]> {
    return this.nftRepo.findByProject(projectId);
  }

  async findByIdentity(identityId: string): Promise<NFTSync[]> {
    return this.nftRepo.findByIdentity(identityId);
  }
}
