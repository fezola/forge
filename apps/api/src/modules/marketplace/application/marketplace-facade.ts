import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MarketplaceFacade {
  constructor(private readonly prisma: PrismaClient) {}

  async getListings(filters?: { category?: string; type?: string; status?: string; featured?: boolean }) {
    const where: any = {};
    if (filters?.category) where.category = filters.category;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.featured !== undefined) where.featured = filters.featured;
    return this.prisma.marketplaceListing.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { reviews: true, installations: true } } },
    });
  }

  async searchListings(query: string) {
    return this.prisma.marketplaceListing.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tagline: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      include: { _count: { select: { reviews: true, installations: true } } },
    });
  }

  async getListing(id: string) {
    return this.prisma.marketplaceListing.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: 'desc' } }, reviews: { where: { status: 'approved' } } },
    });
  }

  async createListing(data: { name: string; slug: string; tagline?: string; description?: string; category?: string; type?: string; icon?: string; authorId: string; authorName?: string; license?: string; tags?: string[]; docsUrl?: string; sourceUrl?: string; supportUrl?: string }) {
    return this.prisma.marketplaceListing.create({
      data: { ...data, category: data.category || 'connector', type: data.type || 'free' },
      include: { _count: { select: { reviews: true, installations: true } } },
    });
  }

  async updateListing(id: string, data: any) {
    return this.prisma.marketplaceListing.update({ where: { id }, data, include: { _count: { select: { reviews: true, installations: true } } } });
  }

  async deleteListing(id: string) {
    await this.prisma.marketplaceListing.delete({ where: { id } });
  }

  async getVersions(listingId: string) {
    return this.prisma.marketplaceVersion.findMany({ where: { listingId }, orderBy: { createdAt: 'desc' } });
  }

  async createVersion(data: { listingId: string; version: string; changelog?: string; packageUrl?: string; sizeBytes?: number; dependencies?: string[] }) {
    return this.prisma.marketplaceVersion.create({ data });
  }

  async getReviews(listingId: string) {
    return this.prisma.marketplaceReview.findMany({
      where: { listingId, status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstalls(projectId?: string) {
    return this.prisma.marketplaceInstall.findMany({
      where: projectId ? { projectId } : {},
      include: { listing: true },
      orderBy: { installedAt: 'desc' },
    });
  }

  async getStats() {
    const [totalListings, totalInstalls, totalReviews, categories] = await Promise.all([
      this.prisma.marketplaceListing.count(),
      this.prisma.marketplaceInstall.count(),
      this.prisma.marketplaceReview.count({ where: { status: 'approved' } }),
      this.prisma.marketplaceListing.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } } }),
    ]);
    return { totalListings, totalInstalls, totalReviews, topCategories: categories.map(c => ({ category: c.category, count: c._count })) };
  }
}
