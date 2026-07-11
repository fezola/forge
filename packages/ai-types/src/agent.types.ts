export interface AiAgent {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  description?: string | null;
  systemPrompt: string;
  modelId?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
  tools: string[];
  memoryEnabled: boolean;
  maxMemorySize: number;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export type AgentStatus = 'active' | 'inactive' | 'archived';
