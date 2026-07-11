import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IChainRepository } from '../domain/repository-interfaces';
import type { Chain } from '@forge/blockchain-types';

@Injectable()
export class ChainService {
  constructor(@Inject('IChainRepository') private readonly chainRepo: IChainRepository) {}

  async findAll(enabledOnly?: boolean): Promise<Chain[]> {
    return this.chainRepo.findAll(enabledOnly);
  }

  async findById(id: string): Promise<Chain> {
    const chain = await this.chainRepo.findById(id);
    if (!chain) throw new NotFoundException('Chain not found');
    return chain;
  }

  async findBySlug(slug: string): Promise<Chain> {
    const chain = await this.chainRepo.findBySlug(slug);
    if (!chain) throw new NotFoundException('Chain not found');
    return chain;
  }

  async create(data: { name: string; slug: string; chainId: number; network?: string; rpcUrl?: string; explorerUrl?: string; symbol?: string; decimals?: number; sortOrder?: number }): Promise<Chain> {
    return this.chainRepo.create(data);
  }

  async update(id: string, data: Partial<Chain>): Promise<Chain> {
    await this.findById(id);
    return this.chainRepo.update(id, data);
  }
}
