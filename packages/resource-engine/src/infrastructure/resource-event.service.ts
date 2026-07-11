import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { ResourceEvent, ResourceEventType } from '@forge/resource-types';
import type { IResourceEventPort } from '../domain/resource-interfaces';

@Injectable()
export class ResourceEventService implements IResourceEventPort {
  private available = true;

  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async emit(event: ResourceEvent): Promise<void> {
    this.eventEmitter.emit(event.type, event);
    this.eventEmitter.emit('resource.*', event);
  }

  subscribe(type: ResourceEventType, handler: (event: ResourceEvent) => void): void {
    this.eventEmitter.on(type, handler);
  }

  unsubscribe(type: ResourceEventType, handler: (event: ResourceEvent) => void): void {
    this.eventEmitter.off(type, handler);
  }

  isAvailable(): boolean {
    return this.available;
  }
}