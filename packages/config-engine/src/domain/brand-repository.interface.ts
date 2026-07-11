import type { BrandConfig, BrandConfigInput, BlockchainConfig, BlockchainConfigInput, AiConfig, AiConfigInput } from '@forge/config-types';

export const IBrandRepository = Symbol('IBrandRepository');

export interface IBrandRepository {
  get(projectId: string): Promise<BrandConfig | null>;
  upsert(projectId: string, input: BrandConfigInput & { updatedBy: string }): Promise<BrandConfig>;
  delete(projectId: string): Promise<void>;
}

export const IBlockchainConfigRepository = Symbol('IBlockchainConfigRepository');

export interface IBlockchainConfigRepository {
  findByProject(projectId: string): Promise<BlockchainConfig[]>;
  findByChain(projectId: string, chain: string, network?: string): Promise<BlockchainConfig | null>;
  upsert(projectId: string, input: BlockchainConfigInput & { id: string; createdBy: string }): Promise<BlockchainConfig>;
  delete(id: string): Promise<void>;
}

export const IAiConfigRepository = Symbol('IAiConfigRepository');

export interface IAiConfigRepository {
  findByProject(projectId: string): Promise<AiConfig[]>;
  findByProvider(projectId: string, provider: string): Promise<AiConfig | null>;
  upsert(projectId: string, input: AiConfigInput & { id: string; createdBy: string }): Promise<AiConfig>;
  delete(id: string): Promise<void>;
}