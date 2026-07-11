import type { ChatMessage, ChatCompletionResponse } from './completion.types';
import type { EmbeddingResponse } from './embedding.types';

export interface AiProviderInterface {
  readonly provider: string;
  chat(input: { model: string; messages: ChatMessage[]; temperature?: number; maxTokens?: number; topP?: number; stream?: boolean }): Promise<ChatCompletionResponse>;
  embed(input: { input: string | string[]; model?: string; dimensions?: number }): Promise<EmbeddingResponse>;
  listModels(): Promise<{ id: string; name: string }[]>;
}

export interface AiProviderConfig {
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}
