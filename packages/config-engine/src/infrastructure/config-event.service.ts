import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { ConfigEventType } from '@forge/config-types';
import { IConfigEventEmitter } from '../domain/config-event-emitter.interface';

@Injectable()
export class ConfigEventService implements IConfigEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(eventType: ConfigEventType, payload: Record<string, unknown>): void {
    this.eventEmitter.emit(eventType, payload);
  }

  async emitAsync(eventType: ConfigEventType, payload: Record<string, unknown>): Promise<void> {
    await this.eventEmitter.emitAsync(eventType, payload);
  }
}