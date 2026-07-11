import { Injectable, Inject } from '@nestjs/common';
import { ISubscriptionManager } from '../domain/subscription.manager.interface';
import { SubscriptionEvent } from '@forge/reactive-types';
import { EventEmitter } from 'events';

@Injectable()
export class SubscriptionManagerService implements ISubscriptionManager {
  private subscriptions: Map<string, { clientId: string; sourceId: string; bindingId?: string }> = new Map();
  private clientSubscriptions: Map<string, Set<string>> = new Map();
  private emitter: EventEmitter = new EventEmitter();
  private subCounter = 0;

  async subscribe(clientId: string, sourceId: string, bindingId?: string, filters?: Record<string, unknown>): Promise<string> {
    const id = `sub_${++this.subCounter}`;
    this.subscriptions.set(id, { clientId, sourceId, bindingId });

    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }
    this.clientSubscriptions.get(clientId)!.add(id);

    return id;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) {
      this.clientSubscriptions.get(sub.clientId)?.delete(subscriptionId);
      this.subscriptions.delete(subscriptionId);
    }
  }

  async unsubscribeAll(clientId: string): Promise<void> {
    const subs = this.clientSubscriptions.get(clientId);
    if (subs) {
      for (const id of subs) {
        this.subscriptions.delete(id);
      }
      this.clientSubscriptions.delete(clientId);
    }
  }

  emit(sourceId: string, data: unknown): void {
    this.emitter.emit(sourceId, data);
  }

  onEvent(sourceId: string, callback: (data: unknown) => void): void {
    this.emitter.on(sourceId, callback);
  }

  removeListener(sourceId: string, callback: (data: unknown) => void): void {
    this.emitter.removeListener(sourceId, callback);
  }
}
