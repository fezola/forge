type EventHandler = (data: unknown) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private onceHandlers: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
    return () => {
      const h = this.handlers.get(event);
      if (h) {
        const idx = h.indexOf(handler);
        if (idx >= 0) h.splice(idx, 1);
      }
    };
  }

  once(event: string, handler: EventHandler): void {
    if (!this.onceHandlers.has(event)) this.onceHandlers.set(event, []);
    this.onceHandlers.get(event)!.push(handler);
  }

  emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) handlers.forEach((h) => h(data));
    const once = this.onceHandlers.get(event);
    if (once) {
      once.forEach((h) => h(data));
      this.onceHandlers.delete(event);
    }
  }

  off(event: string, handler: EventHandler): void {
    const h = this.handlers.get(event);
    if (h) {
      const idx = h.indexOf(handler);
      if (idx >= 0) h.splice(idx, 1);
    }
  }

  clear(): void {
    this.handlers.clear();
    this.onceHandlers.clear();
  }

  listenerCount(event: string): number {
    return (this.handlers.get(event)?.length || 0) + (this.onceHandlers.get(event)?.length || 0);
  }
}

export const eventBus = new EventBus();
export type { EventHandler };
