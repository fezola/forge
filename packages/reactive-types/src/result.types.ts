export interface BindingResult {
  success: boolean;
  value: unknown;
  resolved: boolean;
  source: string;
  path?: string;
  error?: string;
  cached: boolean;
  timestamp: string;
}

export interface SubscriptionResult {
  sourceId: string;
  data: unknown;
  event: string;
  timestamp: string;
}

export interface ExpressionEvalResult {
  success: boolean;
  result?: unknown;
  error?: string;
  ast?: string;
}

export interface ResolveBindingsRequest {
  projectId: string;
  bindings: Array<{
    id: string;
    source: Record<string, unknown>;
    transform?: Record<string, unknown>;
  }>;
  context?: Record<string, unknown>;
}

export interface ResolveBindingsResponse {
  results: BindingResult[];
}
