import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IdentityEvent, IdentityEventType, IdentityEventPayload, IdentityEventHandler, IIdentityEventBus } from '@forge/identity-types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class IdentityEventBus implements IIdentityEventBus {
  private readonly handlers = new Map<string, Set<IdentityEventHandler>>();
  private readonly wildcardHandlers = new Set<IdentityEventHandler>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emit(payload: IdentityEventPayload): Promise<IdentityEvent> {
    const event: IdentityEvent = {
      id: uuid(),
      type: payload.type,
      projectId: payload.projectId,
      identityId: payload.identityId,
      timestamp: new Date().toISOString(),
      data: payload.data,
      source: payload.source as any,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    };

    const typeHandlers = this.handlers.get(payload.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        await handler(event);
      }
    }

    for (const handler of this.wildcardHandlers) {
      await handler(event);
    }

    this.eventEmitter.emit(`identity.${payload.type}`, event);
    return event;
  }

  subscribe(type: IdentityEventType | '*', handler: IdentityEventHandler): void {
    if (type === '*') {
      this.wildcardHandlers.add(handler);
    } else {
      const existing = this.handlers.get(type) ?? new Set();
      existing.add(handler);
      this.handlers.set(type, existing);
    }
  }

  unsubscribe(type: IdentityEventType | '*', handler: IdentityEventHandler): void {
    if (type === '*') {
      this.wildcardHandlers.delete(handler);
    } else {
      const existing = this.handlers.get(type);
      if (existing) {
        existing.delete(handler);
        if (existing.size === 0) this.handlers.delete(type);
      }
    }
  }
}