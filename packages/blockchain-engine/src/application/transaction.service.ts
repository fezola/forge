import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITransactionRepository } from '../domain/repository-interfaces';
import type { Transaction, SendTransactionRequest } from '@forge/blockchain-types';

@Injectable()
export class TransactionService {
  constructor(@Inject('ITransactionRepository') private readonly txRepo: ITransactionRepository) {}

  async findByProject(projectId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    return this.txRepo.findByProject(projectId, limit, offset);
  }

  async findByHash(hash: string): Promise<Transaction> {
    const tx = await this.txRepo.findByHash(hash);
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async findByAddress(address: string, limit = 50, offset = 0): Promise<Transaction[]> {
    return this.txRepo.findByAddress(address, limit, offset);
  }
}
