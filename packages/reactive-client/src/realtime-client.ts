import { ReactiveClientConfig } from './reactive-client';
import { WebSocketMessage, SubscriptionEvent } from '@forge/reactive-types';

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private connected = false;

  constructor(private config: ReactiveClientConfig) {}

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    const wsUrl = this.config.wsUrl || this.config.baseUrl.replace(/^http/, 'ws');
    this.ws = new WebSocket(`${wsUrl}/reactive`);

    this.ws.onopen = () => { this.connected = true; };
    this.ws.onclose = () => { this.connected = false; };
    this.ws.onmessage = (event) => {
      const message: SubscriptionEvent = JSON.parse(event.data);
      const sourceListeners = this.listeners.get(message.sourceId);
      if (sourceListeners) sourceListeners.forEach(cb => cb(message.data));
    };
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  subscribe(sourceId: string, onData: (data: unknown) => void): void {
    if (!this.listeners.has(sourceId)) this.listeners.set(sourceId, []);
    this.listeners.get(sourceId)!.push(onData);

    this.send({ type: 'subscribe', payload: { sourceId } });
  }

  unsubscribe(sourceId: string, onData: (data: unknown) => void): void {
    const list = this.listeners.get(sourceId);
    if (list) {
      const idx = list.indexOf(onData);
      if (idx >= 0) list.splice(idx, 1);
      if (list.length === 0) this.listeners.delete(sourceId);
    }
  }

  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}
