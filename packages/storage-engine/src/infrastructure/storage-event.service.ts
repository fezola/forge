import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid';
import type {
  StorageEvent, StorageEventType, StorageEventPayload,
} from '@forge/storage-types';
import type { IStorageWorkflowBridge } from '../domain/storage-interfaces';

@Injectable()
export class StorageEventService {
  private readonly logger = new Logger(StorageEventService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Optional()
    @Inject('IStorageWorkflowBridge')
    private readonly workflowBridge?: IStorageWorkflowBridge,
  ) {}

  async emit(
    type: StorageEventType,
    payload: StorageEventPayload,
    actorId: string,
    projectId: string,
    bucketId: string,
    fileId?: string,
  ): Promise<void> {
    const event: StorageEvent = {
      id: uuid(),
      type,
      projectId,
      bucketId,
      fileId,
      actorId,
      timestamp: new Date().toISOString(),
      payload: payload as unknown as Record<string, unknown>,
    };

    this.eventEmitter.emit(type, event);
    this.eventEmitter.emit('storage.*', event);

    if (this.workflowBridge?.isAvailable()) {
      try {
        await this.workflowBridge.emitWorkflowEvent(event);
      } catch (err) {
        this.logger.warn(`Workflow bridge failed for ${type}: ${(err as Error).message}`);
      }
    }
  }

  subscribe(type: StorageEventType | '*', handler: (event: StorageEvent) => void): void {
    const eventName = type === '*' ? 'storage.*' : type;
    this.eventEmitter.on(eventName, handler);
  }

  unsubscribe(type: StorageEventType | '*', handler: (event: StorageEvent) => void): void {
    const eventName = type === '*' ? 'storage.*' : type;
    this.eventEmitter.off(eventName, handler);
  }
}