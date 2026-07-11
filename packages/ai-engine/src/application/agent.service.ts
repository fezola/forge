import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IAgentRepository } from '../domain/repository-interfaces';
import type { AiAgent } from '@forge/ai-types';

@Injectable()
export class AgentService {
  constructor(@Inject('IAgentRepository') private readonly agentRepo: IAgentRepository) {}

  async findByProject(projectId: string): Promise<AiAgent[]> {
    return this.agentRepo.findByProject(projectId);
  }

  async findById(id: string): Promise<AiAgent> {
    const agent = await this.agentRepo.findById(id);
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async create(data: { projectId: string; name: string; slug: string; description?: string; systemPrompt: string; modelId?: string; temperature?: number; maxTokens?: number; tools?: string[]; memoryEnabled?: boolean }): Promise<AiAgent> {
    return this.agentRepo.create(data as any);
  }

  async update(id: string, data: Partial<AiAgent>): Promise<AiAgent> {
    await this.findById(id);
    return this.agentRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.agentRepo.delete(id);
  }
}
