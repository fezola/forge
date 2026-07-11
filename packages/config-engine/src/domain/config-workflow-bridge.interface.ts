import type { ConfigEventType } from '@forge/config-types';

export const IConfigWorkflowBridge = Symbol('IConfigWorkflowBridge');

export interface IConfigWorkflowBridge {
  trigger(eventType: ConfigEventType, payload: Record<string, unknown>): Promise<void>;
}