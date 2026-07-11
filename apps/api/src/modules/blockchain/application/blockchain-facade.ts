import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BlockchainFacade {
  constructor(private readonly prisma: PrismaClient) {}

  async getChains(enabledOnly?: boolean) {
    return this.prisma.chain.findMany({
      where: enabledOnly ? { enabled: true } : {},
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getChain(id: string) {
    return this.prisma.chain.findUnique({ where: { id } });
  }

  async createChain(data: { name: string; slug: string; chainId: number; network?: string; rpcUrl?: string; explorerUrl?: string; symbol?: string; decimals?: number; sortOrder?: number }) {
    return this.prisma.chain.create({ data });
  }

  async updateChain(id: string, data: any) {
    return this.prisma.chain.update({ where: { id }, data });
  }

  async getContracts(projectId?: string) {
    return this.prisma.contract.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' },
      include: { chain: true },
    });
  }

  async getContract(id: string) {
    return this.prisma.contract.findUnique({ where: { id }, include: { chain: true } });
  }

  async createContract(data: { chainId: string; projectId: string; address: string; name: string; type?: string; abi?: any }) {
    return this.prisma.contract.create({ data, include: { chain: true } });
  }

  async updateContract(id: string, data: any) {
    return this.prisma.contract.update({ where: { id }, data, include: { chain: true } });
  }

  async deleteContract(id: string) {
    await this.prisma.contract.delete({ where: { id } });
  }

  async getTransactions(projectId?: string, address?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (address) where.fromAddress = address;
    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getTransaction(id: string) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  async getWallets(identityId?: string) {
    return this.prisma.wallet.findMany({
      where: identityId ? { identityId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}
