import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPromptRepository } from '../domain/repository-interfaces';
import type { AiPrompt, CreatePromptRequest } from '@forge/ai-types';

@Injectable()
export class PromptService {
  constructor(@Inject('IPromptRepository') private readonly promptRepo: IPromptRepository) {}

  async findByProject(projectId: string): Promise<AiPrompt[]> {
    return this.promptRepo.findByProject(projectId);
  }

  async findById(id: string): Promise<AiPrompt> {
    const prompt = await this.promptRepo.findById(id);
    if (!prompt) throw new NotFoundException('Prompt not found');
    return prompt;
  }

  async create(data: CreatePromptRequest & { projectId: string }): Promise<AiPrompt> {
    return this.promptRepo.create(data as any);
  }

  async update(id: string, data: Partial<AiPrompt>): Promise<AiPrompt> {
    await this.findById(id);
    return this.promptRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.promptRepo.delete(id);
  }
}
