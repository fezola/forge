export interface ISubscriptionManager {
  subscribe(clientId: string, sourceId: string, bindingId?: string, filters?: Record<string, unknown>): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;
  unsubscribeAll(clientId: string): Promise<void>;
  emit(sourceId: string, data: unknown): void;
}
