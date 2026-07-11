export interface AiModel {
  id: string;
  provider: string;
  name: string;
  modelId: string;
  capabilities: string[];
  contextLength: number;
  pricing?: { input: number; output: number } | null;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
}

export type AiProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere' | 'together' | 'custom';
