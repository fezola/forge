export interface AiEmbedding {
  id: string;
  projectId: string;
  resourceId?: string | null;
  resourceType?: string | null;
  text: string;
  model: string;
  dimensions: number;
  vector: number[];
  createdAt: string;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: { promptTokens: number; totalTokens: number };
}
