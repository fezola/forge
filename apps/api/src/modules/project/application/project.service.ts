import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaClient) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'project';
  }

  async create(data: { name: string; description?: string }, userId: string) {
    const slug = this.slugify(data.name);
    return this.prisma.project.create({
      data: { name: data.name, slug, description: data.description, userId },
      include: { _count: { select: { databases: true, storage: true, connectors: true } } },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { databases: true, storage: true, connectors: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: { _count: { select: { databases: true, storage: true, connectors: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, data: { name?: string; description?: string }, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: { ...data, ...(data.name ? { slug: this.slugify(data.name) } : {}) },
      include: { _count: { select: { databases: true, storage: true, connectors: true } } },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.project.delete({ where: { id } });
  }
}
