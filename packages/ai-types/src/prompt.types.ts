export interface AiPrompt {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  description?: string | null;
  systemPrompt?: string | null;
  userTemplate?: string | null;
  modelId?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
  topP?: number | null;
  variables: string[];
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptRequest {
  name: string;
  slug: string;
  description?: string;
  systemPrompt?: string;
  userTemplate?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  variables?: string[];
  tags?: string[];
}

export interface ExecutePromptRequest {
  promptId: string;
  variables?: Record<string, string>;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}
