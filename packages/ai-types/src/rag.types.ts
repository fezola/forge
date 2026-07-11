export interface AiRagSource {
  id: string;
  projectId: string;
  name: string;
  type: string;
  content?: string | null;
  fileUrl?: string | null;
  chunkSize: number;
  chunkOverlap: number;
  status: RagStatus;
  chunkCount?: number | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RagStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface RagQuery {
  query: string;
  sourceIds?: string[];
  topK?: number;
  minScore?: number;
}

export interface RagResult {
  chunks: RagChunk[];
  query: string;
}

export interface RagChunk {
  text: string;
  score: number;
  sourceId: string;
  sourceName: string;
  metadata?: Record<string, unknown>;
}
