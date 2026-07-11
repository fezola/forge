import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IEmbeddingRepository } from '../domain/repository-interfaces';
import type { IAiProvider } from '../domain/ai-provider.interface';
import type { AiEmbedding, EmbeddingRequest } from '@forge/ai-types';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    @Inject('IEmbeddingRepository') private readonly embeddingRepo: IEmbeddingRepository,
    @Inject('IAiProvider') private readonly aiProvider: IAiProvider,
  ) {}

  async create(input: EmbeddingRequest & { projectId: string; resourceId?: string; resourceType?: string }): Promise<AiEmbedding[]> {
    const response = await this.aiProvider.embed({ input: input.input, model: input.model, dimensions: input.dimensions });
    const inputs = Array.isArray(input.input) ? input.input : [input.input];
    const embeddings: AiEmbedding[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const emb = await this.embeddingRepo.create({
        projectId: input.projectId,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
        text: inputs[i],
        model: response.model,
        dimensions: response.embeddings[i].length,
        vector: response.embeddings[i],
      });
      embeddings.push(emb);
    }
    return embeddings;
  }

  async search(projectId: string, query: string, limit = 10): Promise<{ id: string; text: string; score: number }[]> {
    const response = await this.aiProvider.embed({ input: query });
    return this.embeddingRepo.search(projectId, response.embeddings[0], limit);
  }
}
