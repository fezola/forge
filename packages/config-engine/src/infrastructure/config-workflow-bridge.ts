import { Injectable } from '@nestjs/common';
import type { ConfigEventType } from '@forge/config-types';
import { IConfigWorkflowBridge } from '../domain/config-workflow-bridge.interface';

@Injectable()
export class ConfigWorkflowBridge implements IConfigWorkflowBridge {
  async trigger(_eventType: ConfigEventType, _payload: Record<string, unknown>): Promise<void> {
    // Will be wired to the Workflow Engine's event system in M5 integration.
    // For now, this is a stub that logs the trigger.
    // At integration time, this will call WorkflowEngineService.trigger().
    // Future: await this.workflowEngine.trigger(eventType, payload);
  }
}