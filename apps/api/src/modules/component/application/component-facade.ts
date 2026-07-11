import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ComponentFacade {
  constructor(private readonly prisma: PrismaClient) {}

  async getComponents(filters?: { type?: string; categoryId?: string; status?: string; isPublic?: boolean }) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.status) where.status = filters.status;
    if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic;
    return this.prisma.componentRegistry.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { category: true, _count: { select: { versions: true, installations: true } } },
    });
  }

  async searchComponents(query: string) {
    return this.prisma.componentRegistry.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      include: { category: true, _count: { select: { versions: true, installations: true } } },
    });
  }

  async getComponent(id: string) {
    return this.prisma.componentRegistry.findUnique({
      where: { id },
      include: { category: true, versions: { orderBy: { createdAt: 'desc' } }, installations: true },
    });
  }

  async createComponent(data: { name: string; slug: string; description?: string; categoryId?: string; type?: string; framework?: string; authorId: string; authorName?: string; license?: string; tags?: string[]; isPublic?: boolean }) {
    return this.prisma.componentRegistry.create({
      data: { ...data, framework: data.framework || 'react', type: data.type || 'ui' },
      include: { category: true },
    });
  }

  async updateComponent(id: string, data: any) {
    return this.prisma.componentRegistry.update({ where: { id }, data, include: { category: true } });
  }

  async deleteComponent(id: string) {
    await this.prisma.componentRegistry.delete({ where: { id } });
  }

  async getCategories() {
    return this.prisma.componentCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { children: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async createCategory(data: { name: string; slug: string; description?: string; icon?: string; sortOrder?: number; parentId?: string }) {
    return this.prisma.componentCategory.create({ data });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.componentCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    await this.prisma.componentCategory.delete({ where: { id } });
  }

  async getVersions(componentId: string) {
    return this.prisma.componentVersion.findMany({
      where: { componentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createVersion(data: { componentId: string; version: string; changelog?: string; packageUrl?: string; sourceUrl?: string; entryPoint?: string; dependencies?: string[]; sizeBytes?: number }) {
    return this.prisma.componentVersion.create({ data });
  }

  async getInstalls(projectId?: string) {
    return this.prisma.componentInstall.findMany({
      where: projectId ? { projectId } : {},
      include: { component: true },
      orderBy: { installedAt: 'desc' },
    });
  }

  async installComponent(componentId: string, projectId: string, installedBy: string) {
    return this.prisma.componentInstall.create({
      data: { componentId, projectId, version: 'latest', installedBy },
      include: { component: true },
    });
  }

  async uninstallComponent(id: string) {
    await this.prisma.componentInstall.delete({ where: { id } });
  }
}
