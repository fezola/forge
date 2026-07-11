import type { ChatMessage, ChatCompletionResponse, EmbeddingResponse } from '@forge/ai-types';

export interface IAiProvider {
  readonly provider: string;
  chat(input: { model: string; messages: ChatMessage[]; temperature?: number; maxTokens?: number; topP?: number; stream?: boolean }): Promise<ChatCompletionResponse>;
  embed(input: { input: string | string[]; model?: string; dimensions?: number }): Promise<EmbeddingResponse>;
  listModels(): Promise<{ id: string; name: string }[]>;
}
