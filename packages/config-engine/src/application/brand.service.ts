import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { BrandConfig, BrandConfigInput, BlockchainConfig, BlockchainConfigInput, AiConfig, AiConfigInput } from '@forge/config-types';
import { IBrandRepository, IBlockchainConfigRepository, IAiConfigRepository } from '../domain/brand-repository.interface';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';
import { IConfigEventEmitter } from '../domain/config-event-emitter.interface';

@Injectable()
export class BrandService {
  constructor(
    @Inject(IBrandRepository) private readonly brandRepo: IBrandRepository,
    @Inject(IBlockchainConfigRepository) private readonly blockchainRepo: IBlockchainConfigRepository,
    @Inject(IAiConfigRepository) private readonly aiRepo: IAiConfigRepository,
    @Inject(IConfigAuditLog) private readonly audit: IConfigAuditLog,
    @Inject(IConfigEventEmitter) private readonly events: IConfigEventEmitter,
  ) {}

  async getBrand(projectId: string): Promise<BrandConfig | null> {
    return this.brandRepo.get(projectId);
  }

  async upsertBrand(projectId: string, input: BrandConfigInput, updatedBy: string): Promise<BrandConfig> {
    const brand = await this.brandRepo.upsert(projectId, { ...input, updatedBy });
    await this.audit.log({ id: uuid(), projectId, action: 'brand.updated', actorId: updatedBy, timestamp: new Date().toISOString() });
    this.events.emit('brand.updated', { projectId, updatedBy });
    return brand;
  }

  async deleteBrand(projectId: string, deletedBy: string): Promise<void> {
    await this.brandRepo.delete(projectId);
    await this.audit.log({ id: uuid(), projectId, action: 'brand.updated', actorId: deletedBy, details: 'Brand config deleted', timestamp: new Date().toISOString() });
  }

  async getBlockchainConfigs(projectId: string): Promise<BlockchainConfig[]> {
    return this.blockchainRepo.findByProject(projectId);
  }

  async upsertBlockchainConfig(projectId: string, input: BlockchainConfigInput, createdBy: string): Promise<BlockchainConfig> {
    const config = await this.blockchainRepo.upsert(projectId, { ...input, id: uuid(), createdBy });
    await this.audit.log({ id: uuid(), projectId, action: 'blockchain.updated', actorId: createdBy, details: `Updated blockchain config '${input.chain}'`, timestamp: new Date().toISOString() });
    this.events.emit('blockchain.updated', { projectId, chain: input.chain, createdBy });
    return config;
  }

  async deleteBlockchainConfig(id: string): Promise<void> {
    await this.blockchainRepo.delete(id);
  }

  async getAiConfigs(projectId: string): Promise<AiConfig[]> {
    return this.aiRepo.findByProject(projectId);
  }

  async upsertAiConfig(projectId: string, input: AiConfigInput, createdBy: string): Promise<AiConfig> {
    const config = await this.aiRepo.upsert(projectId, { ...input, id: uuid(), createdBy });
    await this.audit.log({ id: uuid(), projectId, action: 'ai.updated', actorId: createdBy, details: `Updated AI config '${input.provider}'`, timestamp: new Date().toISOString() });
    this.events.emit('ai.updated', { projectId, provider: input.provider, createdBy });
    return config;
  }

  async deleteAiConfig(id: string): Promise<void> {
    await this.aiRepo.delete(id);
  }
}