import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IContractRepository, IChainRepository } from '../domain/repository-interfaces';
import type { Contract, DeployContractRequest } from '@forge/blockchain-types';

@Injectable()
export class ContractService {
  constructor(
    @Inject('IContractRepository') private readonly contractRepo: IContractRepository,
    @Inject('IChainRepository') private readonly chainRepo: IChainRepository,
  ) {}

  async findByProject(projectId: string): Promise<Contract[]> {
    return this.contractRepo.findByProject(projectId);
  }

  async findById(id: string): Promise<Contract> {
    const contract = await this.contractRepo.findById(id);
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async create(data: { chainId: string; projectId: string; address: string; name: string; type?: string; abi?: Record<string, unknown>; metadata?: Record<string, unknown> }): Promise<Contract> {
    const chain = await this.chainRepo.findById(data.chainId);
    if (!chain) throw new NotFoundException('Chain not found');
    return this.contractRepo.create(data);
  }

  async update(id: string, data: Partial<Contract>): Promise<Contract> {
    await this.findById(id);
    return this.contractRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.contractRepo.delete(id);
  }
}
