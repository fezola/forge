import type { ActionInputField, ActionOutputField } from './action.interface';

export type TriggerType = 'polling' | 'webhook';

export interface ConnectorTrigger {
  id: string;
  name: string;
  description: string;
  type: TriggerType;
  pollingInterval?: number;
  input: ActionInputField[];
  output: ActionOutputField[];
  path?: string;
}