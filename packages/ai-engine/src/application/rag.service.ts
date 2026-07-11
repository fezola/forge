import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IRagRepository, IEmbeddingRepository } from '../domain/repository-interfaces';
import type { IAiProvider } from '../domain/ai-provider.interface';
import type { AiRagSource, RagQuery, RagResult } from '@forge/ai-types';

@Injectable()
export class RagService {
  constructor(
    @Inject('IRagRepository') private readonly ragRepo: IRagRepository,
    @Inject('IEmbeddingRepository') private readonly embeddingRepo: IEmbeddingRepository,
    @Inject('IAiProvider') private readonly aiProvider: IAiProvider,
  ) {}

  async findByProject(projectId: string): Promise<AiRagSource[]> {
    return this.ragRepo.findByProject(projectId);
  }

  async findById(id: string): Promise<AiRagSource> {
    const source = await this.ragRepo.findById(id);
    if (!source) throw new NotFoundException('RAG source not found');
    return source;
  }

  async query(input: RagQuery & { projectId: string }): Promise<RagResult> {
    const response = await this.aiProvider.embed({ input: input.query });
    const chunks = await this.embeddingRepo.search(input.projectId, response.embeddings[0], input.topK || 10);
    return { chunks, query: input.query };
  }
}
