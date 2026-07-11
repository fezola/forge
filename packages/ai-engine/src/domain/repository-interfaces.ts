import type { AiModel, AiPrompt, AiCompletion, AiEmbedding, AiRagSource, AiAgent } from '@forge/ai-types';

export interface IModelRepository {
  findAll(provider?: string, enabledOnly?: boolean): Promise<AiModel[]>;
  findById(id: string): Promise<AiModel | null>;
  findByModelId(modelId: string): Promise<AiModel | null>;
  create(data: { provider: string; name: string; modelId: string; capabilities?: string[]; contextLength?: number; pricing?: Record<string, unknown>; sortOrder?: number }): Promise<AiModel>;
  update(id: string, data: Partial<AiModel>): Promise<AiModel>;
}

export interface IPromptRepository {
  findByProject(projectId: string): Promise<AiPrompt[]>;
  findById(id: string): Promise<AiPrompt | null>;
  findBySlug(projectId: string, slug: string): Promise<AiPrompt | null>;
  create(data: { projectId: string; name: string; slug: string; description?: string; systemPrompt?: string; userTemplate?: string; modelId?: string; temperature?: number; maxTokens?: number; topP?: number; variables?: string[]; tags?: string[]; metadata?: Record<string, unknown> }): Promise<AiPrompt>;
  update(id: string, data: Partial<AiPrompt>): Promise<AiPrompt>;
  delete(id: string): Promise<void>;
}

export interface ICompletionRepository {
  findByProject(projectId: string, limit?: number, offset?: number): Promise<AiCompletion[]>;
  findById(id: string): Promise<AiCompletion | null>;
  findByPrompt(promptId: string): Promise<AiCompletion[]>;
  create(data: { promptId?: string; projectId: string; modelId: string; provider: string; prompt: string; response: string; inputTokens: number; outputTokens: number; totalTokens: number; latencyMs?: number; cost?: number; finishReason?: string; temperature?: number; maxTokens?: number; metadata?: Record<string, unknown> }): Promise<AiCompletion>;
}

export interface IEmbeddingRepository {
  findByProject(projectId: string): Promise<AiEmbedding[]>;
  findByResource(resourceId: string): Promise<AiEmbedding[]>;
  search(projectId: string, queryVector: number[], limit?: number): Promise<{ id: string; text: string; score: number; metadata?: Record<string, unknown> }[]>;
  create(data: { projectId: string; resourceId?: string; resourceType?: string; text: string; model: string; dimensions: number; vector: number[]; metadata?: Record<string, unknown> }): Promise<AiEmbedding>;
  delete(id: string): Promise<void>;
}

export interface IRagRepository {
  findByProject(projectId: string): Promise<AiRagSource[]>;
  findById(id: string): Promise<AiRagSource | null>;
  create(data: { projectId: string; name: string; type?: string; content?: string; fileUrl?: string; chunkSize?: number; chunkOverlap?: number; metadata?: Record<string, unknown> }): Promise<AiRagSource>;
  update(id: string, data: Partial<AiRagSource>): Promise<AiRagSource>;
  delete(id: string): Promise<void>;
}

export interface IAgentRepository {
  findByProject(projectId: string): Promise<AiAgent[]>;
  findById(id: string): Promise<AiAgent | null>;
  findBySlug(projectId: string, slug: string): Promise<AiAgent | null>;
  create(data: { projectId: string; name: string; slug: string; description?: string; systemPrompt: string; modelId?: string; temperature?: number; maxTokens?: number; tools?: string[]; memoryEnabled?: boolean; maxMemorySize?: number; metadata?: Record<string, unknown> }): Promise<AiAgent>;
  update(id: string, data: Partial<AiAgent>): Promise<AiAgent>;
  delete(id: string): Promise<void>;
}
