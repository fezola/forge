import { Injectable, Optional, Logger } from '@nestjs/common';
import type { StorageEvent } from '@forge/storage-types';
import type { IStorageWorkflowBridge } from '../domain/storage-interfaces';

@Injectable()
export class StorageWorkflowBridgeService implements IStorageWorkflowBridge {
  private readonly logger = new Logger(StorageWorkflowBridgeService.name);
  private available = false;

  constructor(
    @Optional()
    private readonly workflowTrigger?: { trigger(event: unknown): Promise<void> },
  ) {
    this.available = !!workflowTrigger;
  }

  async emitWorkflowEvent(event: StorageEvent): Promise<void> {
    if (!this.workflowTrigger) return;
    try {
      await this.workflowTrigger.trigger({
        source: 'storage',
        type: event.type,
        payload: event.payload,
        projectId: event.projectId,
        actorId: event.actorId,
        timestamp: event.timestamp,
      });
    } catch (err) {
      this.logger.error(`Failed to emit workflow event: ${(err as Error).message}`);
    }
  }

  isAvailable(): boolean {
    return this.available;
  }
}