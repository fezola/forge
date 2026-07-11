import { Injectable, Optional, Logger } from '@nestjs/common';
import type { ResourceEvent } from '@forge/resource-types';
import type { IResourceWorkflowPort } from '../domain/resource-interfaces';

@Injectable()
export class ResourceWorkflowBridgeService implements IResourceWorkflowPort {
  private readonly logger = new Logger(ResourceWorkflowBridgeService.name);
  private available = false;

  constructor(
    @Optional()
    private readonly workflowTrigger?: { trigger(event: unknown): Promise<void> },
  ) {
    this.available = !!workflowTrigger;
  }

  async emitWorkflowEvent(event: ResourceEvent): Promise<void> {
    if (!this.workflowTrigger) return;
    try {
      await this.workflowTrigger.trigger({
        source: 'resource',
        type: event.type,
        payload: event,
        projectId: event.projectId,
        actorId: event.actorId,
        timestamp: event.timestamp,
      });
    } catch (err) {
      this.logger.error(`Workflow trigger failed: ${(err as Error).message}`);
    }
  }

  isAvailable(): boolean {
    return this.available;
  }
}