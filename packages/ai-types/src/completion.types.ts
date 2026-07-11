export interface AiCompletion {
  id: string;
  promptId?: string | null;
  projectId: string;
  modelId: string;
  provider: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs?: number | null;
  cost?: number | null;
  finishReason?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
  createdAt: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  content: string;
  finishReason?: string;
  inputTokens: number;
  outputTokens: number;
}
