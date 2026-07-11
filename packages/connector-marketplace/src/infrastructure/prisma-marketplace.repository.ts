import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IMarketplaceRepository } from '../domain/marketplace.repository.interface';
import { MarketplaceEntryEntity } from '../domain/marketplace-entry.entity';

@Injectable()
export class PrismaMarketplaceRepository implements IMarketplaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<MarketplaceEntryEntity | null> {
    return this.prisma.marketplaceEntry.findUnique({ where: { id } }) as any;
  }

  async findByManifestId(manifestId: string): Promise<MarketplaceEntryEntity | null> {
    return this.prisma.marketplaceEntry.findUnique({ where: { manifestId } }) as any;
  }

  async search(query: string, category?: string, page = 1, limit = 20): Promise<{ items: MarketplaceEntryEntity[]; total: number }> {
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ],
    };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.marketplaceEntry.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { downloads: 'desc' } }),
      this.prisma.marketplaceEntry.count({ where }),
    ]);
    return { items: items as any, total };
  }

  async listByCategory(category: string): Promise<MarketplaceEntryEntity[]> {
    return this.prisma.marketplaceEntry.findMany({ where: { category }, orderBy: { downloads: 'desc' } }) as any;
  }

  async list(page = 1, limit = 20): Promise<{ items: MarketplaceEntryEntity[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.marketplaceEntry.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { downloads: 'desc' } }),
      this.prisma.marketplaceEntry.count(),
    ]);
    return { items: items as any, total };
  }

  async create(entry: MarketplaceEntryEntity): Promise<MarketplaceEntryEntity> {
    return this.prisma.marketplaceEntry.create({ data: entry as any }) as any;
  }

  async update(id: string, data: Partial<MarketplaceEntryEntity>): Promise<MarketplaceEntryEntity> {
    return this.prisma.marketplaceEntry.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.marketplaceEntry.delete({ where: { id } });
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.prisma.marketplaceEntry.update({ where: { id }, data: { downloads: { increment: 1 } } });
  }
}
