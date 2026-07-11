import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { BrandConfig, BrandConfigInput, BlockchainConfig, BlockchainConfigInput, AiConfig, AiConfigInput } from '@forge/config-types';
import { IBrandRepository, IBlockchainConfigRepository, IAiConfigRepository } from '../domain/brand-repository.interface';

@Injectable()
export class PrismaBrandRepository implements IBrandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(projectId: string): Promise<BrandConfig | null> {
    const row = await this.prisma.brandConfig.findUnique({ where: { projectId } });
    if (!row) return null;
    return {
      id: projectId,
      projectId: row.projectId,
      appName: row.appName,
      logoUrl: row.logoUrl ?? undefined,
      faviconUrl: row.faviconUrl ?? undefined,
      primaryColor: row.primaryColor ?? undefined,
      secondaryColor: row.secondaryColor ?? undefined,
      accentColor: row.accentColor ?? undefined,
      backgroundColor: row.backgroundColor ?? undefined,
      textColor: row.textColor ?? undefined,
      fontFamily: row.fontFamily ?? undefined,
      email: row.email as any,
      auth: row.auth as any,
      invoice: row.invoice as any,
      dashboard: row.dashboard as any,
      customCss: row.customCss ?? undefined,
      customVariables: row.customVariables as any,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy,
    };
  }

  async upsert(projectId: string, input: BrandConfigInput & { updatedBy: string }): Promise<BrandConfig> {
    await this.prisma.brandConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        appName: input.appName ?? '',
        logoUrl: input.logoUrl,
        faviconUrl: input.faviconUrl,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        accentColor: input.accentColor,
        backgroundColor: input.backgroundColor,
        textColor: input.textColor,
        fontFamily: input.fontFamily,
        email: input.email as any,
        auth: input.auth as any,
        invoice: input.invoice as any,
        dashboard: input.dashboard as any,
        customCss: input.customCss,
        customVariables: input.customVariables as any,
        metadata: input.metadata as any,
      },
      update: {
        ...(input.appName !== undefined && { appName: input.appName }),
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        ...(input.faviconUrl !== undefined && { faviconUrl: input.faviconUrl }),
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor }),
        ...(input.secondaryColor !== undefined && { secondaryColor: input.secondaryColor }),
        ...(input.accentColor !== undefined && { accentColor: input.accentColor }),
        ...(input.backgroundColor !== undefined && { backgroundColor: input.backgroundColor }),
        ...(input.textColor !== undefined && { textColor: input.textColor }),
        ...(input.fontFamily !== undefined && { fontFamily: input.fontFamily }),
        ...(input.email !== undefined && { email: input.email as any }),
        ...(input.auth !== undefined && { auth: input.auth as any }),
        ...(input.invoice !== undefined && { invoice: input.invoice as any }),
        ...(input.dashboard !== undefined && { dashboard: input.dashboard as any }),
        ...(input.customCss !== undefined && { customCss: input.customCss }),
        ...(input.customVariables !== undefined && { customVariables: input.customVariables as any }),
        ...(input.metadata !== undefined && { metadata: input.metadata as any }),
      },
    });
    return this.get(projectId) as Promise<BrandConfig>;
  }

  async delete(projectId: string): Promise<void> {
    await this.prisma.brandConfig.delete({ where: { projectId } });
  }
}

@Injectable()
export class PrismaBlockchainConfigRepository implements IBlockchainConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByProject(projectId: string): Promise<BlockchainConfig[]> {
    const rows = await this.prisma.blockchainConfig.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toBlockchainConfig);
  }

  async findByChain(projectId: string, chain: string, network?: string): Promise<BlockchainConfig | null> {
    const where: any = { projectId, chain };
    if (network) where.network = network;
    const row = await this.prisma.blockchainConfig.findFirst({ where });
    return row ? toBlockchainConfig(row) : null;
  }

  async upsert(projectId: string, input: BlockchainConfigInput & { id: string; createdBy: string }): Promise<BlockchainConfig> {
    const row = await this.prisma.blockchainConfig.upsert({
      where: { projectId_chain_network: { projectId, chain: input.chain, network: input.network } },
      create: {
        id: input.id,
        projectId,
        chain: input.chain,
        network: input.network,
        rpcUrl: input.rpcUrl,
        wsUrl: input.wsUrl,
        explorerUrl: input.explorerUrl,
        chainId: input.chainId,
        commitment: input.commitment,
        blockTime: input.blockTime,
        confirmationBlocks: input.confirmationBlocks,
        metadata: input.metadata as any,
        createdBy: input.createdBy,
      },
      update: {
        rpcUrl: input.rpcUrl,
        wsUrl: input.wsUrl,
        explorerUrl: input.explorerUrl,
        chainId: input.chainId,
        commitment: input.commitment,
        blockTime: input.blockTime,
        confirmationBlocks: input.confirmationBlocks,
        metadata: input.metadata as any,
      },
    });
    return toBlockchainConfig(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blockchainConfig.delete({ where: { id } });
  }
}

function toBlockchainConfig(row: any): BlockchainConfig {
  return {
    id: row.id,
    projectId: row.projectId,
    chain: row.chain,
    network: row.network,
    rpcUrl: row.rpcUrl ?? undefined,
    wsUrl: row.wsUrl ?? undefined,
    explorerUrl: row.explorerUrl ?? undefined,
    chainId: row.chainId ?? undefined,
    commitment: row.commitment ?? undefined,
    blockTime: row.blockTime ?? undefined,
    confirmationBlocks: row.confirmationBlocks ?? undefined,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  };
}

@Injectable()
export class PrismaAiConfigRepository implements IAiConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByProject(projectId: string): Promise<AiConfig[]> {
    const rows = await this.prisma.aiConfig.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toAiConfig);
  }

  async findByProvider(projectId: string, provider: string): Promise<AiConfig | null> {
    const row = await this.prisma.aiConfig.findUnique({ where: { projectId_provider: { projectId, provider } } });
    return row ? toAiConfig(row) : null;
  }

  async upsert(projectId: string, input: AiConfigInput & { id: string; createdBy: string }): Promise<AiConfig> {
    const row = await this.prisma.aiConfig.upsert({
      where: { projectId_provider: { projectId, provider: input.provider } },
      create: {
        id: input.id,
        projectId,
        provider: input.provider,
        apiKey: input.apiKey,
        baseUrl: input.baseUrl,
        defaultModel: input.defaultModel,
        defaultTemperature: input.defaultTemperature,
        defaultMaxTokens: input.defaultMaxTokens,
        defaultTopP: input.defaultTopP,
        defaultFrequencyPenalty: input.defaultFrequencyPenalty,
        defaultPresencePenalty: input.defaultPresencePenalty,
        metadata: input.metadata as any,
        createdBy: input.createdBy,
      },
      update: {
        apiKey: input.apiKey,
        baseUrl: input.baseUrl,
        defaultModel: input.defaultModel,
        defaultTemperature: input.defaultTemperature,
        defaultMaxTokens: input.defaultMaxTokens,
        defaultTopP: input.defaultTopP,
        defaultFrequencyPenalty: input.defaultFrequencyPenalty,
        defaultPresencePenalty: input.defaultPresencePenalty,
        metadata: input.metadata as any,
      },
    });
    return toAiConfig(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.aiConfig.delete({ where: { id } });
  }
}

function toAiConfig(row: any): AiConfig {
  return {
    id: row.id,
    projectId: row.projectId,
    provider: row.provider,
    apiKey: row.apiKey ?? undefined,
    baseUrl: row.baseUrl ?? undefined,
    defaultModel: row.defaultModel ?? undefined,
    defaultTemperature: row.defaultTemperature ?? undefined,
    defaultMaxTokens: row.defaultMaxTokens ?? undefined,
    defaultTopP: row.defaultTopP ?? undefined,
    defaultFrequencyPenalty: row.defaultFrequencyPenalty ?? undefined,
    defaultPresencePenalty: row.defaultPresencePenalty ?? undefined,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  };
}