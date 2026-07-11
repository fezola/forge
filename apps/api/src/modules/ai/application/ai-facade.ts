import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AiFacade {
  constructor(private readonly prisma: PrismaClient) {}

  async getModels(provider?: string) {
    return this.prisma.aiModel.findMany({
      where: provider ? { provider } : {},
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getModel(id: string) {
    return this.prisma.aiModel.findUnique({ where: { id } });
  }

  async createModel(data: { provider: string; name: string; modelId: string; capabilities?: string[]; contextLength?: number; sortOrder?: number }) {
    return this.prisma.aiModel.create({ data });
  }

  async getPrompts(projectId?: string) {
    return this.prisma.aiPrompt.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getPrompt(id: string) {
    return this.prisma.aiPrompt.findUnique({ where: { id } });
  }

  async createPrompt(data: { projectId: string; name: string; slug: string; description?: string; systemPrompt?: string; userTemplate?: string; modelId?: string; temperature?: number; maxTokens?: number; variables?: string[]; tags?: string[] }) {
    return this.prisma.aiPrompt.create({ data });
  }

  async updatePrompt(id: string, data: any) {
    return this.prisma.aiPrompt.update({ where: { id }, data });
  }

  async deletePrompt(id: string) {
    await this.prisma.aiPrompt.delete({ where: { id } });
  }

  async getCompletions(projectId?: string) {
    return this.prisma.aiCompletion.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async getCompletion(id: string) {
    return this.prisma.aiCompletion.findUnique({ where: { id } });
  }

  async getRagSources(projectId?: string) {
    return this.prisma.aiRagSource.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAgents(projectId?: string) {
    return this.prisma.aiAgent.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAgent(id: string) {
    return this.prisma.aiAgent.findUnique({ where: { id } });
  }

  async createAgent(data: { projectId: string; name: string; slug: string; description?: string; systemPrompt: string; modelId?: string; temperature?: number; maxTokens?: number; tools?: string[] }) {
    return this.prisma.aiAgent.create({ data });
  }

  async updateAgent(id: string, data: any) {
    return this.prisma.aiAgent.update({ where: { id }, data });
  }

  async deleteAgent(id: string) {
    await this.prisma.aiAgent.delete({ where: { id } });
  }
}
