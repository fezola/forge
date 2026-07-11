export type SubscriptionStatus = 'active' | 'paused' | 'error' | 'closed';

export interface Subscription {
  id: string;
  clientId: string;
  sourceId: string;
  bindingId?: string;
  status: SubscriptionStatus;
  filters?: Record<string, unknown>;
  createdAt: string;
}

export interface SubscriptionEvent {
  type: 'data' | 'error' | 'status_change';
  sourceId: string;
  data?: unknown;
  error?: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'binding_update' | 'query_result';
  payload: Record<string, unknown>;
}
